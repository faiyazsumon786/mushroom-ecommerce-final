// src/app/api/checkout/route.ts

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { CartItem } from '@/lib/cartStore';
import { authOptions } from '../auth/[...nextauth]/route'; // 1. Import your authOptions

const prisma = new PrismaClient();

type CheckoutRequestBody = { 
    items: CartItem[], 
    customerInfo: { 
        customerName: string, 
        shippingAddress: string, 
        customerPhone?: string 
    } 
};

export async function POST(request: Request) {
  // 2. Pass authOptions to getServerSession
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { items, customerInfo } = await request.json() as CheckoutRequestBody;
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let totalAmount = 0;
    const productChecks = items.map(async (item) => {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) throw new Error(`Product with id ${item.id} not found.`);
      if (product.stock < item.quantity) throw new Error(`Not enough stock for ${product.name}.`);
      totalAmount += product.price * item.quantity;
    });
    await Promise.all(productChecks);

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: session.user!.id,
          totalAmount: totalAmount,
          status: 'PENDING',
          customerName: customerInfo.customerName,
          shippingAddress: customerInfo.shippingAddress,
          customerPhone: customerInfo.customerPhone,
        },
      });

      await tx.orderItem.createMany({
        data: items.map(item => ({
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }
      return order;
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
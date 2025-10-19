// src/app/api/wholesale-checkout/route.ts
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { CartItem } from '@/lib/wholesaleCartStore';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession();
  if (session?.user?.role !== 'WHOLESALER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { items } = await request.json() as { items: CartItem[] };
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let totalAmount = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) throw new Error(`Product not found.`);
      if (product.stock < item.quantity) throw new Error(`Not enough stock for ${product.name}.`);
      totalAmount += product.wholesalePrice * item.quantity;
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: session.user.id!,
          totalAmount,
          status: 'PENDING',
          customerName: session.user.name || '',
          shippingAddress: 'To be confirmed',
        },
      });

      await tx.orderItem.createMany({
        data: items.map(item => ({
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.wholesalePrice,
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
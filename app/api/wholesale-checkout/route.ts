// src/app/api/wholesale-checkout/route.ts
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { CartItem } from '@/lib/wholesaleCartStore';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'WHOLESALER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 👇 request body থেকে সব কিছু destructure করে নাও
    const { items, customerInfo, deliveryMethod, deliveryCost, paymentMethod } = await request.json() as {
      items: CartItem[];
      customerInfo: {
        customerName: string;
        shippingAddress: string;
        customerPhone?: string;
      };
      deliveryMethod?: string;
      deliveryCost?: number;
      paymentMethod?: string;
    };

    // cart check
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // price calculation
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
          customerName: customerInfo.customerName,
          shippingAddress: customerInfo.shippingAddress,
          customerPhone: customerInfo.customerPhone ?? '',

          // 👇 এখানে default বা request থেকে নেওয়া value দাও
          deliveryMethod: (deliveryMethod as any) || 'INSIDE_DHAKA',
          deliveryCost: deliveryCost ?? 0,
          paymentMethod: (paymentMethod as any) || 'COD',
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
      console.error('Wholesale checkout error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

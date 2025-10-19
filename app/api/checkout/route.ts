// src/app/api/checkout/route.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { CartItem } from '@/lib/cartStore';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

type CheckoutRequestBody = { 
  items: CartItem[], 
  customerInfo: { 
    customerName: string, 
    shippingAddress: string, 
    customerPhone?: string 
  },
  // frontend should send these exact keys (see frontend example below)
  deliveryMethod: string, // e.g. "INSIDE_DHAKA" or "OUTSIDE_DHAKA" OR user-friendly text (we map both cases)
  deliveryCost: number,
  paymentMethod: string // e.g. "COD" or "DIGITAL" OR user-friendly text (we map both cases)
};

const deliveryMethodMap: Record<string, Prisma.DeliveryMethod> = {
  // accept both enum-like and user-friendly strings
  INSIDE_DHAKA: 'INSIDE_DHAKA',
  OUTSIDE_DHAKA: 'OUTSIDE_DHAKA',
  'Inside Dhaka': 'INSIDE_DHAKA',
  'Outside Dhaka': 'OUTSIDE_DHAKA',
};

const paymentMethodMap: Record<string, Prisma.PaymentMethod> = {
  COD: 'COD',
  DIGITAL: 'DIGITAL',
  'Cash on Delivery': 'COD',
  'Digital': 'DIGITAL',
  'Digital Payment': 'DIGITAL',
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as CheckoutRequestBody;
    const { items, customerInfo, deliveryMethod, deliveryCost, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Map delivery/payment method strings -> Prisma enums
    const mappedDelivery = deliveryMethodMap[deliveryMethod];
    const mappedPayment = paymentMethodMap[paymentMethod];

    if (!mappedDelivery) {
      return NextResponse.json({ error: `Invalid deliveryMethod: ${deliveryMethod}` }, { status: 400 });
    }
    if (!mappedPayment) {
      return NextResponse.json({ error: `Invalid paymentMethod: ${paymentMethod}` }, { status: 400 });
    }

    // stock & total calculation
    let totalItemsAmount = 0;
    const productChecks = items.map(async (item) => {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) throw new Error(`Product with id ${item.id} not found.`);
      if (product.stock < item.quantity) throw new Error(`Not enough stock for ${product.name}.`);
      totalItemsAmount += product.price * item.quantity;
    });
    await Promise.all(productChecks);

    // final amount includes deliveryCost passed from frontend (you may also recalc server-side)
    const totalAmount = totalItemsAmount + (deliveryCost ?? 0);

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: session.user!.id,
          totalAmount: totalAmount,
          status: 'PENDING',
          customerName: customerInfo.customerName ?? '',
          shippingAddress: customerInfo.shippingAddress ?? '',
          customerPhone: customerInfo.customerPhone ?? '',
          deliveryMethod: mappedDelivery,
          deliveryCost: deliveryCost ?? 0,
          paymentMethod: mappedPayment,
          // paymentStatus will use default (DUE) as per schema
        },
      });

      // create order items
      await tx.orderItem.createMany({
        data: items.map(item => ({
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // decrement stock
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
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}

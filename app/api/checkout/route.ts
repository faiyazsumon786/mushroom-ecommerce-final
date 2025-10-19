// src/app/api/checkout/route.ts
import { PrismaClient, DeliveryMethod, PaymentMethod } from '@prisma/client';
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
  deliveryMethod: string, // e.g. "INSIDE_DHAKA" or "Outside Dhaka"
  deliveryCost: number,
  paymentMethod: string // e.g. "COD" or "Digital"
};

// ✅ Map user-friendly strings → Enum values
const deliveryMethodMap: Record<string, DeliveryMethod> = {
  INSIDE_DHAKA: DeliveryMethod.INSIDE_DHAKA,
  OUTSIDE_DHAKA: DeliveryMethod.OUTSIDE_DHAKA,
  'Inside Dhaka': DeliveryMethod.INSIDE_DHAKA,
  'Outside Dhaka': DeliveryMethod.OUTSIDE_DHAKA,
};

const paymentMethodMap: Record<string, PaymentMethod> = {
  COD: PaymentMethod.COD,
  DIGITAL: PaymentMethod.DIGITAL,
  'Cash on Delivery': PaymentMethod.COD,
  'Digital': PaymentMethod.DIGITAL,
  'Digital Payment': PaymentMethod.DIGITAL,
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

    const mappedDelivery = deliveryMethodMap[deliveryMethod];
    const mappedPayment = paymentMethodMap[paymentMethod];

    if (!mappedDelivery) {
      return NextResponse.json({ error: `Invalid deliveryMethod: ${deliveryMethod}` }, { status: 400 });
    }
    if (!mappedPayment) {
      return NextResponse.json({ error: `Invalid paymentMethod: ${paymentMethod}` }, { status: 400 });
    }

    // stock check & total calculation
    let totalItemsAmount = 0;
    const productChecks = items.map(async (item) => {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) throw new Error(`Product with id ${item.id} not found.`);
      if (product.stock < item.quantity) throw new Error(`Not enough stock for ${product.name}.`);
      totalItemsAmount += product.price * item.quantity;
    });
    await Promise.all(productChecks);

    const totalAmount = totalItemsAmount + (deliveryCost ?? 0);

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          status: 'PENDING',
          customerName: customerInfo.customerName,
          shippingAddress: customerInfo.shippingAddress,
          customerPhone: customerInfo.customerPhone ?? '',
          deliveryMethod: mappedDelivery,
          deliveryCost,
          paymentMethod: mappedPayment,
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
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}

<<<<<<< HEAD
=======
// src/app/api/orders/[orderId]/route.ts
>>>>>>> 16c5c8d7ca3a7cc4a118acc9a5632b56a593452f
import { PrismaClient, OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

<<<<<<< HEAD
export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
=======
// চূড়ান্ত সমাধান: আমরা এখন আর দ্বিতীয় আর্গুমেন্ট (context বা params) ব্যবহার করছি না
export async function PATCH(request: NextRequest) {
  try {
    // URL থেকে সরাসরি ID বের করে আনা হচ্ছে
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop(); // URL-এর শেষ অংশটিই হলো ID

>>>>>>> 16c5c8d7ca3a7cc4a118acc9a5632b56a593452f
    if (!id) {
      return NextResponse.json({ error: 'Order ID is missing from URL' }, { status: 400 });
    }

    const { status } = (await request.json()) as { status: OrderStatus };

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (status === OrderStatus.CANCELLED) {
      const orderToCancel = await prisma.order.findUnique({
        where: { id },
        include: { orderItems: true },
      });
<<<<<<< HEAD

      if (!orderToCancel) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

=======
      if (!orderToCancel) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      
>>>>>>> 16c5c8d7ca3a7cc4a118acc9a5632b56a593452f
      await prisma.$transaction(async (tx) => {
        for (const item of orderToCancel.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id },
          data: { status: OrderStatus.CANCELLED },
        });
      });

      return NextResponse.json({ message: 'Order cancelled and stock restored.' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });
<<<<<<< HEAD

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Order update error:', error);
=======
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Order update error:", error);
>>>>>>> 16c5c8d7ca3a7cc4a118acc9a5632b56a593452f
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
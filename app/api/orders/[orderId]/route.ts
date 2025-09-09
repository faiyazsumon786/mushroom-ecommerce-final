// src/app/api/orders/[orderId]/route.ts
import { PrismaClient, OrderStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const id = params.orderId;
    const { status } = (await request.json()) as { status: OrderStatus };

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // যদি অর্ডার বাতিল করা হয়, তাহলে স্টক ফেরত দিতে হবে
    if (status === OrderStatus.CANCELLED) {
      const orderToCancel = await prisma.order.findUnique({
        where: { id },
        include: { orderItems: true },
      });

      if (!orderToCancel) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // ট্রানজেকশন ব্যবহার করে দুটি কাজ একসাথে করা হচ্ছে
      await prisma.$transaction(async (tx) => {
        // ১. প্রতিটি পণ্যের স্টক আবার বাড়িয়ে দেওয়া হচ্ছে
        for (const item of orderToCancel.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        // ২. অর্ডারের স্ট্যাটাস 'CANCELLED' করা হচ্ছে
        await tx.order.update({
          where: { id },
          data: { status: OrderStatus.CANCELLED },
        });
      });

      return NextResponse.json({ message: 'Order cancelled and stock restored.' });
    }

    // অন্যান্য স্ট্যাটাস আপডেটের জন্য পুরনো লজিক
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedOrder);

  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
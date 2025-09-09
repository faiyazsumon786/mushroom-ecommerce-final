import { PrismaClient, Prisma, OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const id = params.orderId;
    const { status } = (await request.json()) as { status: OrderStatus };

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (status === OrderStatus.CANCELLED) {
      const orderToCancel = await prisma.order.findUnique({
        where: { id },
        include: { orderItems: true },
      });
      if (!orderToCancel) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
    return NextResponse.json(updatedOrder);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to update order:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
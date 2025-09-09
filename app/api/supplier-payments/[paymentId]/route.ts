import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { paymentId: string } }
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updatedPayment = await prisma.supplierPayment.update({
      where: { id: params.paymentId },
      data: {
        status: 'PAID',
        processedById: session.user.id,
      },
    });
    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Failed to update payment status:', error);
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
  }
}
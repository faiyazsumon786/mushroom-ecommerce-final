import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

enum ProductStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  LIVE = "LIVE",
  REJECTED = "REJECTED",
}

export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: params.productId },
      data: { status: ProductStatus.LIVE },
    });
    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to approve product:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to approve product' }, { status: 500 });
  }
}
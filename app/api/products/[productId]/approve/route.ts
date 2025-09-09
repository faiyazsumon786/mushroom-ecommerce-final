import { PrismaClient, ProductStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const id = new URL(request.url).pathname.split('/')[4]; // URL থেকে ID নেওয়া হচ্ছে
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { status: ProductStatus.LIVE },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to approve product' }, { status: 500 });
  }
}
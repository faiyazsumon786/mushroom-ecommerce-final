// src/app/api/supplier-products/[productId]/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { productId: string } }) {
  try {
    const data = await request.json();
    const updatedProduct = await prisma.supplierProduct.update({
      where: { id: params.productId },
      data: {
        name: data.name,
        description: data.description,
        wholesalePrice: parseFloat(data.wholesalePrice),
        unit: data.unit,
      },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { productId: string } }) {
  try {
    await prisma.supplierProduct.delete({
      where: { id: params.productId },
    });
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
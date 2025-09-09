// src/app/api/supplier-products/route.ts
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'SUPPLIER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId: session.user.id } });
  if (!supplierProfile) {
    return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
  }

  const products = await prisma.supplierProduct.findMany({ 
    where: { supplierId: supplierProfile.id },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'SUPPLIER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId: session.user.id } });
  if (!supplierProfile) {
    return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
  }

  try {
    const data = await request.json();
    const newProduct = await prisma.supplierProduct.create({
      data: {
        name: data.name,
        description: data.description,
        wholesalePrice: parseFloat(data.wholesalePrice),
        unit: data.unit,
        supplierId: supplierProfile.id,
      },
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
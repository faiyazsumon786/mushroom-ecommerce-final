// src/app/api/supplier/shipments/route.ts
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession();
  if (session?.user?.role !== 'SUPPLIER' || !session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    const shipments = await prisma.shipment.findMany({
      where: { supplierId: supplierProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(shipments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}
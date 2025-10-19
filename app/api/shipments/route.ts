import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

interface ShipmentItemData {
  supplierProductId: string;
  quantity: number;
  unit: string;
  wholesalePrice: number;
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (session?.user?.role !== 'SUPPLIER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!supplierProfile) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    const { items } = (await request.json()) as { items: ShipmentItemData[] };
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Shipment must contain at least one item' }, { status: 400 });
    }

    const totalValue = items.reduce((acc, item) => acc + item.wholesalePrice * item.quantity, 0);

    const newShipment = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const shipment = await tx.shipment.create({
        data: {
          supplierId: supplierProfile.id,
          totalValue,
          status: 'SHIPPED',
        },
      });

      await tx.shipmentItem.createMany({
        data: items.map(item => ({
          shipmentId: shipment.id,
          supplierProductId: item.supplierProductId,
          quantity: item.quantity,
          unit: item.unit,
          wholesalePrice: item.wholesalePrice,
        })),
      });

      return shipment;
    });

    return NextResponse.json(newShipment, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}
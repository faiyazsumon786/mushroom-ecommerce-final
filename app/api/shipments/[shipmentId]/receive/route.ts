import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { shipmentId: string } }
) {
  const session = await getServerSession();
  const employeeId = session?.user?.id;
  const userRole = session?.user?.role;

  if (!employeeId || (userRole !== 'EMPLOYEE' && userRole !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const shipmentId = params.shipmentId;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
        include: { items: { include: { product: true } } },
      });

      if (!shipment || shipment.status === 'RECEIVED') {
        throw new Error('Shipment not found or already received.');
      }

      const updatedShipment = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: 'RECEIVED',
          receivedAt: new Date(),
        },
      });

      for (const item of shipment.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.stockEntry.create({
        data: {
          shipmentId: shipment.id,
          receivedById: employeeId,
        },
      });

      await tx.supplierPayment.create({
        data: {
          supplierId: shipment.supplierId,
          amount: shipment.totalValue,
          status: 'DUE',
          shipmentId: shipment.id,
        },
      });

      return updatedShipment;
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to receive shipment' }, { status: 500 });
  }
}
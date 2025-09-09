import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { shipmentId: string } }
) {
  const session = await getServerSession(authOptions);
  const employeeId = session?.user?.id;
  const userRole = session?.user?.role;

  if (!employeeId || (userRole !== 'EMPLOYEE' && userRole !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const shipmentId = params.shipmentId;
    const result = await prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
        include: { items: true },
      });

      if (!shipment || shipment.status === 'RECEIVED') {
        throw new Error('Shipment not found or already received.');
      }
      
      const updatedShipment = await tx.shipment.update({
        where: { id: shipmentId },
        data: { status: 'RECEIVED', receivedAt: new Date() },
      });

      for (const item of shipment.items) {
        // We need to find the main product associated with the supplier's product
        const supplierProduct = await tx.supplierProduct.findUnique({
            where: { id: item.supplierProductId },
            include: { mainProduct: true }
        });
        if(supplierProduct?.mainProduct?.id) {
            await tx.product.update({
                where: { id: supplierProduct.mainProduct.id },
                data: { stock: { increment: item.quantity } },
            });
        }
      }

      await tx.stockEntry.create({
        data: { shipmentId: shipment.id, receivedById: employeeId },
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to receive shipment' }, { status: 500 });
  }
}
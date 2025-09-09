import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const employeeId = session.user.id;

  try {
    const { productId, supplierId, quantity } = await request.json();

    if (
      typeof productId !== 'string' ||
      typeof supplierId !== 'string' ||
      typeof quantity !== 'number' ||
      quantity <= 0
    ) {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    // প্রোডাক্ট খুঁজে বের করো
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const paymentAmount = product.wholesalePrice * quantity;

    // ট্রানজেকশন শুরু
    const result = await prisma.$transaction(async (prisma) => {
      // ১. StockEntry তৈরি
      const newStockEntry = await prisma.stockEntry.create({
        data: {
          productId,
          supplierId,
          quantity,
          receivedById: employeeId,
        },
      });

      // ২. Product এর stock আপডেট
      await prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            increment: quantity,
          },
        },
      });

      // ৩. SupplierPayment তৈরি (StockEntry এর সাথে লিঙ্ক সহ)
      const newPayment = await prisma.supplierPayment.create({
        data: {
          supplierId,
          amount: paymentAmount,
          status: 'DUE',
          stockEntryId: newStockEntry.id,
          // processedById: null, // প্রয়োজন হলে এখানে employeeId দিতে পারো
        },
      });

      return { newStockEntry, newPayment };
    });

    return NextResponse.json({
      message: 'Stock and payment record created successfully',
      stockEntry: result.newStockEntry,
      payment: result.newPayment,
    });
  } catch (error) {
    console.error('Stock entry error:', error);
    return NextResponse.json({ error: 'Failed to create stock entry' }, { status: 500 });
  }
}
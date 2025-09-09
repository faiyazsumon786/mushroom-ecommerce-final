import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const employeeId = session?.user?.id;
  const userRole = session?.user?.role;

  if (!employeeId || (userRole !== 'EMPLOYEE' && userRole !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // URL থেকে চালান বা Shipment ID বের করা হচ্ছে
    const shipmentId = new URL(request.url).pathname.split('/')[4];
    if (!shipmentId) {
        return NextResponse.json({ error: 'Shipment ID is missing' }, { status: 400 });
    }
    
    // ট্রানজেকশন ব্যবহার করে সব কাজ একসাথে করা হচ্ছে যাতে কোনো একটি ব্যর্থ হলে বাকিগুলোও বাতিল হয়ে যায়
    const result = await prisma.$transaction(async (tx) => {
      // ১. চালানটি এবং এর ভেতরের আইটেমগুলো খুঁজে বের করা হচ্ছে
      const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
        include: { 
            items: { 
                include: { 
                    supplierProduct: {
                        include: {
                            mainProduct: true // মূল প্রোডাক্টের তথ্যও নিয়ে আসা হচ্ছে
                        }
                    }
                } 
            } 
        },
      });

      if (!shipment || shipment.status === 'RECEIVED') {
        throw new Error('Shipment not found or has already been received.');
      }

      // ২. চালানের স্ট্যাটাস 'RECEIVED'-এ পরিবর্তন করা হচ্ছে
      const updatedShipment = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: 'RECEIVED',
          receivedAt: new Date(),
        },
      });

      // ৩. চালানের প্রতিটি আইটেম অনুযায়ী মূল প্রোডাক্টের স্টক বাড়ানো হচ্ছে
      for (const item of shipment.items) {
        // যদি সাপ্লায়ারের প্রোডাক্টটি মূল কোনো প্রোডাক্টের সাথে যুক্ত থাকে
        if (item.supplierProduct.mainProduct?.id) {
          await tx.product.update({
            where: { id: item.supplierProduct.mainProduct.id },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // ৪. স্টক গ্রহণের একটি লগ বা ইতিহাস তৈরি করা হচ্ছে
      await tx.stockEntry.create({
        data: {
          shipmentId: shipment.id,
          receivedById: employeeId,
        },
      });

      // ৫. সাপ্লায়ারের জন্য একটি বকেয়া ('DUE') পেমেন্ট রেকর্ড তৈরি করা হচ্ছে
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
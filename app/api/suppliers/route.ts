// src/app/api/suppliers/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// শুধুমাত্র সেই সব সাপ্লায়ারদের নিয়ে আসা হবে যাদের সাথে ইউজার যুক্ত আছে
export async function GET() {
  try {
    const suppliers = await prisma.supplierProfile.findMany({
      where: {
        // নিশ্চিত করা হচ্ছে যে user সম্পর্কটি ফাঁকা নয়
        user: {
          isNot: null,
        },
      },
      include: {
        user: true, // ইউজারের তথ্যসহ নিয়ে আসা হচ্ছে
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}
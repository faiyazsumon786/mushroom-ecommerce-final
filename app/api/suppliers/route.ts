// src/app/api/suppliers/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // FIX: The incorrect 'where' clause has been removed.
    // This is the simple and correct way to fetch all suppliers with their user info.
    const suppliers = await prisma.supplierProfile.findMany({
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
    console.error("Failed to fetch suppliers:", error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}
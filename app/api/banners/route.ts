import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// এই API রুটটি শুধুমাত্র فعال ব্যানারগুলো public-ভাবে দেখানোর জন্য
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
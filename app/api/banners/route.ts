// src/app/api/banners/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// This is a public route to get active banners for the homepage
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

// This is a protected route for admins to create new banners
export async function POST(request: Request) {
  // Add session check here to ensure only ADMIN can post
  // The logic will be similar to product creation (upload to Cloudinary, get URL, save to DB)
  // For brevity, we'll focus on the frontend integration first.
}
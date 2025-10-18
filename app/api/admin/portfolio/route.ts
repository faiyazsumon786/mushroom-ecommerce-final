// src/app/api/admin/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const article = await prisma.portfolioArticle.findUnique({
      where: { id: "main_portfolio" },
      include: { images: { orderBy: { id: 'desc' } } }
    });
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch portfolio data.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const { title, content } = await request.json();

    const article = await prisma.portfolioArticle.upsert({
      where: { id: "main_portfolio" },
      update: { title, content },
      create: { id: "main_portfolio", title, content },
    });

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save portfolio article.' }, { status: 500 });
  }
}
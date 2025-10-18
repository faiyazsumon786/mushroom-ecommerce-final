import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ProductType } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const type = searchParams.get('type') as ProductType | null;
  const sortBy = searchParams.get('sortBy') || 'createdAt_desc';

  const [sortField, sortOrder] = sortBy.split('_');
  
  const whereClause: any = {
    status: 'LIVE',
    name: {
      contains: query,
      mode: 'insensitive',
    },
  };

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (type && Object.values(ProductType).includes(type)) {
    whereClause.type = type;
  }

  try {
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { [sortField]: sortOrder },
      include: { 
        category: true,
        images: true// <-- মূল পরিবর্তন: এখন ক্যাটাগরির সম্পূর্ণ তথ্যও আসবে
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
import { PrismaClient, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt_desc';

  const [sortField, sortOrder] = sortBy.split('_');

  // Prisma এর ProductWhereInput টাইপ ব্যবহার
  const whereClause: Prisma.ProductWhereInput = {
    status: 'LIVE',
    name: {
      contains: query,
      mode: 'insensitive',
    },
  };

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  try {
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: {
        [sortField]: sortOrder as 'asc' | 'desc',
      },
      include: {
        category: true,
      },
    });
    return NextResponse.json(products);
  } catch (error: unknown) {
    // error ব্যবহার করো
    if (error instanceof Error) {
      console.error('Search products error:', error.message);
    }
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
// src/app/api/categories/route.ts
import { PrismaClient, Category } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// সব ক্যাটাগরি get করার জন্য
export async function GET() {
  try {
    const categories: Category[] = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET /categories Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// নতুন ক্যাটাগরি তৈরি করার জন্য
export async function POST(request: Request) {
  try {
    const body: { name?: string } = await request.json();
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const newCategory: Category = await prisma.category.create({
      data: { name: body.name },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('POST /categories Error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

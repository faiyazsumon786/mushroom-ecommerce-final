import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized. Please log in to submit a review.' }, { status: 401 });
  }

  try {
    const { productId, rating, comment } = await request.json();

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Product ID and a rating between 1 and 5 are required.' }, { status: 400 });
    }

    const newReview = await prisma.review.create({
      data: {
        productId,
        rating,
        comment,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 409 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
  }
}
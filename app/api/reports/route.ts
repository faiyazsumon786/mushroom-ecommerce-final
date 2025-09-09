import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { reportText } = await request.json();
    if (!reportText) {
      return NextResponse.json({ error: 'Report text cannot be empty' }, { status: 400 });
    }

    const newReport = await prisma.dailyReport.create({
      data: {
        reportText,
        employeeId: session.user.id,
      },
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error('Failed to submit report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
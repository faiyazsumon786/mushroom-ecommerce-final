// src/app/api/auth/register/route.ts

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in the database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role, // 'EMPLOYEE', 'SUPPLIER', etc.
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
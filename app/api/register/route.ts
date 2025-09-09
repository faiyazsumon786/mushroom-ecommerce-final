// src/app/api/register/route.ts
import { PrismaClient, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user with the CUSTOMER role
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.CUSTOMER, // New users are always customers
      },
    });

    return NextResponse.json({ message: 'User created successfully', userId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
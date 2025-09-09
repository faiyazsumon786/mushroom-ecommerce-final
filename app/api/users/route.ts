// src/app/api/users/route.ts (updated)

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// ... existing GET function ...

// ইউজার আপডেট করার জন্য
export async function PUT(request: Request) {
  try {
    const { id, name, email, role } = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, role },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// ইউজার ডিলিট করার জন্য
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
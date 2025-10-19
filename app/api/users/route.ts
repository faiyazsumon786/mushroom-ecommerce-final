import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    // শুধুমাত্র অ্যাডমিনরাই এই API ব্যবহার করতে পারবে
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { name, email, password, role } = await request.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as Role, // অ্যাডমিনের দেওয়া role অনুযায়ী ইউজার তৈরি হচ্ছে
            },
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
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
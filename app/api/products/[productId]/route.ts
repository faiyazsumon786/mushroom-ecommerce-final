import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
    try {
        const id = new URL(request.url).pathname.split('/').pop();
        const data = await request.json();
        const updatedProduct = await prisma.product.update({
            where: { id },
            data,
        });
        return NextResponse.json(updatedProduct);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const id = new URL(request.url).pathname.split('/').pop();
        await prisma.product.delete({ where: { id } });
        return NextResponse.json({ message: 'Product deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
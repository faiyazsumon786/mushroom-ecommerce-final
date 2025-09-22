import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// একটি নির্দিষ্ট পোস্টের ডেটা আনার জন্য
export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const post = await prisma.post.findUnique({
            where: { id: params.postId },
            include: { products: true }
        });
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

// একটি নির্দিষ্ট পোস্ট আপডেট করার জন্য
export async function PUT(request: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const data = await request.json();
        const { title, content, status, productIds } = data;
        
        const updatedPost = await prisma.post.update({
            where: { id: params.postId },
            data: {
                title,
                content,
                status,
                products: {
                    set: productIds.map((id: string) => ({ id })),
                }
            },
        });
        return NextResponse.json(updatedPost);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

// একটি নির্দিষ্ট পোস্ট ডিলিট করার জন্য
export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
    try {
        await prisma.post.delete({
            where: { id: params.postId }
        });
        return NextResponse.json({ message: "Post deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
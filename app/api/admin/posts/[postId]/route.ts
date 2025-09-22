import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: একটি নির্দিষ্ট পোস্টের ডেটা আনার জন্য
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { products: true },
    });
    if (!post)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PUT: একটি নির্দিষ্ট পোস্ট আপডেট করার জন্য
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    const data = await request.json();
    const { title, content, status, productIds } = data;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        status,
        products: {
          set: productIds.map((id: string) => ({ id })),
        },
      },
    });
    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE: একটি নির্দিষ্ট পোস্ট ডিলিট করার জন্য
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    await prisma.post.delete({
      where: { id: postId },
    });
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

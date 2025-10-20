// src/app/api/admin/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "blog_images" },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export async function GET(request: NextRequest) {
  try {
    // Query params optional: ?status=PUBLISHED or ?limit=20 etc.
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const take = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;

    const where: any = {};
    if (status) where.status = status;

    const posts = await prisma.post.findMany({
      where,
      include: { author: true, products: true },
      orderBy: { createdAt: "desc" },
      take,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/admin/posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role;

    if (!session || (userRole !== "ADMIN" && userRole !== "EMPLOYEE")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const status = (formData.get("status") as "DRAFT" | "PUBLISHED") || "DRAFT";
    const imageFile = formData.get("featuredImage") as File | null;
    const productIds = formData.getAll("productIds").map(String);

    if (!title || !content || !imageFile) {
      return NextResponse.json({ error: "Title, content, and image are required." }, { status: 400 });
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const uploadResult = await uploadToCloudinary(buffer);

    let slug = createSlug(title);
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const newPost = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        status,
        featuredImageUrl: uploadResult.secure_url,
        authorId: session.user.id,
        products: {
          connect: productIds.map((id) => ({ id })),
        },
      },
      include: { products: true, author: true },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/posts error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

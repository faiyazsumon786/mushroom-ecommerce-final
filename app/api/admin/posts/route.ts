// src/app/api/admin/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (err, result) => {
            if (err || !result) return reject(err);
            resolve(result);
        });
        stream.end(buffer);
    });
}

// A helper function to create a URL-friendly slug from a title
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w-]+/g, '')        // Remove all non-word chars
        .replace(/--+/g, '-');          // Replace multiple - with single -
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role;

    if (!session || (userRole !== 'ADMIN' && userRole !== 'EMPLOYEE')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const status = formData.get('status') as 'DRAFT' | 'PUBLISHED';
        const imageFile = formData.get('featuredImage') as File | null;
        const productIds = formData.getAll('productIds') as string[];

        if (!title || !content || !imageFile) {
            return NextResponse.json({ error: 'Title, content, and image are required.' }, { status: 400 });
        }

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadResult = await uploadToCloudinary(buffer);
        
        // FIX: The timestamp has been removed from the slug generation
        const slug = createSlug(title);

        // Optional: Check if slug already exists and append a number if it does
        // This is more advanced logic we can add later if needed.

        const newPost = await prisma.post.create({
            data: {
                title,
                slug,
                content,
                status,
                featuredImageUrl: uploadResult.secure_url,
                authorId: session.user.id,
                products: {
                    connect: productIds.map(id => ({ id })),
                },
            }
        });
        
        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
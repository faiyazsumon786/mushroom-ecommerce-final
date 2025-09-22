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
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (err, result) => {
            if (err || !result) return reject(err);
            resolve(result);
        });
        uploadStream.end(buffer);
    });
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const imageFile = formData.get('image') as File;
        const title = formData.get('title') as string;
        const link = formData.get('link') as string;

        if (!imageFile) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }
        
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadResult = await uploadToCloudinary(buffer);
        
        const newBanner = await prisma.banner.create({
            data: {
                imageUrl: uploadResult.secure_url,
                title,
                link,
            }
        });
        
        return NextResponse.json(newBanner, { status: 201 });
    } catch (error) {
        console.error("Failed to fetch banners:", error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
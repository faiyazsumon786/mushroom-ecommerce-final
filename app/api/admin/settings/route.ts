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

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const logoFile = formData.get('logo') as File | null;

        if (!logoFile || logoFile.size === 0) {
            return NextResponse.json({ error: 'Logo image is required' }, { status: 400 });
        }
        
        const buffer = Buffer.from(await logoFile.arrayBuffer());
        const uploadResult = await uploadToCloudinary(buffer);

        await prisma.siteSetting.upsert({
            where: { key: 'logoUrl' },
            update: { value: uploadResult.secure_url },
            create: { key: 'logoUrl', value: uploadResult.secure_url },
        });
        
        return NextResponse.json({ success: true, url: uploadResult.secure_url });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update logo' }, { status: 500 });
    }
}
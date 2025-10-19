import { NextRequest, NextResponse } from "next/server";
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
    try {
        const formData = await request.formData();
        const imageFile = formData.get('image') as File | null;

        if (!imageFile) {
            return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
        }

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadResult = await uploadToCloudinary(buffer);

        return NextResponse.json({ url: uploadResult.secure_url });

    } catch (error) {
        return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFiles = formData.getAll('images') as File[];

    const uploadPromises = imageFiles
      .filter(file => file.size > 0)
      .map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return uploadToCloudinary(buffer);
      });

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map(result => result.secure_url);

    if (imageUrls.length > 0) {
      await prisma.portfolioImage.createMany({
        data: imageUrls.map(url => ({ imageUrl: url, articleId: "main_portfolio" })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Failed to upload images.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { imageId } = await request.json();
    await prisma.portfolioImage.delete({
      where: { id: imageId },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Image delete error:', error);
    return NextResponse.json({ error: 'Failed to delete image.' }, { status: 500 });
  }
}
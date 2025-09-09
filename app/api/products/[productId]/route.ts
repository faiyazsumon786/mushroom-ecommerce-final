import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve(result);
      }
    );
    upload.end(buffer);
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    let imageUrl: string | undefined;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadResult = await uploadToCloudinary(buffer);
      imageUrl = uploadResult.secure_url;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: params.productId },
      data: {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        wholesalePrice: parseFloat(formData.get('wholesalePrice') as string),
        stock: parseInt(formData.get('stock') as string),
        categoryId: formData.get('categoryId') as string,
        supplierId: formData.get('supplierId') as string,
        ...(imageUrl && { image: imageUrl }),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Update Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.productId },
    });
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Delete Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
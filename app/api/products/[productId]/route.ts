// src/app/api/products/[productId]/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary globally
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Update Product (PUT)
export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const id = params.productId;
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    let imageUrl: string | undefined;

    // Check if a new image is uploaded
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('Cloudinary upload failed'));
            resolve(result);
          })
          .end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
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
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// ✅ Delete Product (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const id = params.productId;
  try {
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

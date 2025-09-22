import { ProductStatus } from '@prisma/client';
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
    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
      if (error || !result) return reject(error);
      resolve(result);
    });
    uploadStream.end(buffer);
  });
}

// প্রোডাক্ট আপডেট করার জন্য (Edit)
export async function PUT(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const formData = await request.formData();
        const productData: any = {};

        // যে ফিল্ডগুলো পাঠানো হয়েছে, শুধু সেগুলোই productData অবজেক্টে যোগ করা হচ্ছে
        const fields = ['name', 'shortDescription', 'description', 'price', 'wholesalePrice', 'stock', 'weight', 'weightUnit', 'type', 'categoryId', 'subcategoryId'];
        fields.forEach(field => {
            if (formData.has(field)) {
                const value = formData.get(field) as string;
                if (['price', 'wholesalePrice', 'weight'].includes(field)) {
                    productData[field] = parseFloat(value);
                } else if (field === 'stock') {
                    productData[field] = parseInt(value);
                } else if (value) { // Ensure empty strings for optional fields are handled
                    productData[field] = value;
                }
            }
        });
        
        // যদি নতুন কোনো প্রাইমারি ছবি আপলোড করা হয়
        const primaryImageFile = formData.get('primaryImage') as File;
        if (primaryImageFile && primaryImageFile.size > 0) {
            const primaryImageBuffer = Buffer.from(await primaryImageFile.arrayBuffer());
            const primaryImageUpload = await uploadToCloudinary(primaryImageBuffer);
            productData.image = primaryImageUpload.secure_url;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: params.productId },
            data: productData,
        });

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to update product', details: error.message }, { status: 500 });
    }
}

// প্রোডাক্ট আর্কাইভ করার জন্য
export async function DELETE(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        await prisma.product.update({
            where: { id: params.productId },
            data: { status: ProductStatus.ARCHIVED },
        });
        return NextResponse.json({ message: 'Product archived successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to archive product' }, { status: 500 });
    }
}
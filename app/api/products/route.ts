// src/app/api/products/route.ts
import { PrismaClient, ProductStatus, ProductType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload a buffer to Cloudinary
async function uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
      if (error || !result) return reject(error);
      resolve(result);
    });
    uploadStream.end(buffer);
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const primaryImageFile = formData.get('primaryImage') as File | null;

    if (!primaryImageFile || primaryImageFile.size === 0) {
      return NextResponse.json({ error: 'Primary image is required.' }, { status: 400 });
    }

    // Upload primary image first
    const primaryImageBuffer = Buffer.from(await primaryImageFile.arrayBuffer());
    const primaryImageUpload = await uploadToCloudinary(primaryImageBuffer);
    
    // Gallery images are uploaded in parallel for speed
    const galleryImageFiles = formData.getAll('galleryImages') as File[];
    const uploadPromises = galleryImageFiles
      .filter(file => file.size > 0)
      .map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return uploadToCloudinary(buffer);
      });

    const galleryUploadResults = await Promise.all(uploadPromises);
    const galleryImageUrls = galleryUploadResults.map(result => result.secure_url);

    // ... (The rest of the code for validation and saving to Prisma remains the same)
    const data = Object.fromEntries(formData.entries());
    const userRole = session.user.role;
    const productStatus = userRole === 'ADMIN' ? ProductStatus.LIVE : ProductStatus.PENDING_APPROVAL;

    const newProduct = await prisma.product.create({
        data: {
            name: data.name as string,
            shortDescription: data.shortDescription as string,
            description: data.description as string,
            price: parseFloat(data.price as string),
            wholesalePrice: parseFloat(data.wholesalePrice as string),
            stock: parseInt(data.stock as string),
            weight: data.weight ? parseFloat(data.weight as string) : null,
            weightUnit: data.weightUnit as string | null,

            type: data.type as ProductType,
            categoryId: data.categoryId as string,
            subcategoryId: (data.subcategoryId as string) || null,
            supplierId: data.supplierId as string,
            createdById: session.user.id,
            status: productStatus,
            image: primaryImageUpload.secure_url,
            images: {
                create: galleryImageUrls.map(url => ({ url })),
            },
        },
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}
import { ProductStatus, ProductType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

// Function to get all products for the admin panel
export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                createdBy: true, // No longer includes 'supplier'
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// Function to create a new product
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // We re-check the database to ensure the session user actually exists
        const creatingUser = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!creatingUser) {
            throw new Error('Session user not found in database. Please log out and log in again.');
        }

        const formData = await request.formData();
        const primaryImageFile = formData.get('primaryImage') as File | null;

        if (!primaryImageFile || primaryImageFile.size === 0) {
            return NextResponse.json({ error: 'Primary image is required.' }, { status: 400 });
        }

        const primaryImageBuffer = Buffer.from(await primaryImageFile.arrayBuffer());
        const primaryImageUpload = await uploadToCloudinary(primaryImageBuffer);
        
        const galleryImageFiles = formData.getAll('galleryImages') as File[];
        const uploadPromises = galleryImageFiles
          .filter(file => file.size > 0)
          .map(async (file) => {
            const buffer = Buffer.from(await file.arrayBuffer());
            return uploadToCloudinary(buffer);
          });
        const galleryUploadResults = await Promise.all(uploadPromises);
        const galleryImageUrls = galleryUploadResults.map(result => result.secure_url);

        const userRole = session.user.role;
        const productStatus = userRole === 'ADMIN' ? ProductStatus.LIVE : ProductStatus.PENDING_APPROVAL;

        const productData: any = {
            name: formData.get('name') as string,
            shortDescription: formData.get('shortDescription') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            wholesalePrice: parseFloat(formData.get('wholesalePrice') as string),
            minWholesaleOrderQuantity: parseInt(formData.get('minWholesaleOrderQuantity') as string),
            stock: parseInt(formData.get('stock') as string),
            type: formData.get('type') as ProductType,
            categoryId: formData.get('categoryId') as string,
            createdById: creatingUser.id,
            status: productStatus,
            image: primaryImageUpload.secure_url,
            images: {
                create: galleryImageUrls.map(url => ({ url })),
            },
        };

        const subcategoryId = formData.get('subcategoryId') as string;
        if (subcategoryId) productData.subcategoryId = subcategoryId;

        const weight = formData.get('weight') as string;
        if (weight && weight.trim() !== '') productData.weight = parseFloat(weight);

        const weightUnit = formData.get('weightUnit') as string;
        if (weightUnit) productData.weightUnit = weightUnit;
        
        const newProduct = await prisma.product.create({
            data: productData,
        });

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error: any) {
        console.error("Product creation error:", error);
        return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
    }
}
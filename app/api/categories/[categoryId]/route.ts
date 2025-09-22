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
        const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (err, result) => {
            if (err || !result) return reject(err);
            resolve(result);
        });
        stream.end(buffer);
    });
}

// ক্যাটাগরি আপডেট করার জন্য
export async function PUT(request: NextRequest, { params }: { params: { categoryId: string } }) {
    try {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const imageFile = formData.get('image') as File | null;
        
        const dataToUpdate: { name: string; imageUrl?: string } = { name };

        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const uploadResult = await uploadToCloudinary(buffer);
            dataToUpdate.imageUrl = uploadResult.secure_url;
        }

        const updatedCategory = await prisma.category.update({
            where: { id: params.categoryId },
            data: dataToUpdate,
        });
        return NextResponse.json(updatedCategory);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// ক্যাটাগরি ডিলিট করার জন্য (চূড়ান্ত সমাধানসহ)
export async function DELETE(request: NextRequest, { params }: { params: { categoryId: string } }) {
    try {
        // ধাপ ১: চেক করা হচ্ছে এই ক্যাটাগরিতে কোনো প্রোডাক্ট আছে কিনা
        const productCount = await prisma.product.count({
            where: { categoryId: params.categoryId },
        });

        if (productCount > 0) {
            // যদি প্রোডাক্ট থাকে, তাহলে একটি নির্দিষ্ট এরর মেসেজ পাঠানো হচ্ছে
            return NextResponse.json(
                { error: `Cannot delete. This category is used by ${productCount} product(s).` },
                { status: 409 } // 409 Conflict
            );
        }

        // যদি কোনো প্রোডাক্ট না থাকে, তাহলে ডিলিট করা হবে
        await prisma.category.delete({
            where: { id: params.categoryId },
        });
        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
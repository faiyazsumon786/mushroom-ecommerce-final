import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// PUT: ক্যাটাগরি আপডেট
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await context.params;
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;

    const dataToUpdate: { name: string; imageUrl?: string } = { name };

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadResult = await uploadToCloudinary(buffer);
      dataToUpdate.imageUrl = uploadResult.secure_url;
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE: ক্যাটাগরি ডিলিট
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await context.params;

    const productCount = await prisma.product.count({
      where: { categoryId },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete. This category is used by ${productCount} product(s).`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

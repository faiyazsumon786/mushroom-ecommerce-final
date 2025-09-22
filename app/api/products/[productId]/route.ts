import { ProductStatus } from "@prisma/client";
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
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

// PUT: প্রোডাক্ট আপডেট
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await context.params;
    const formData = await request.formData();
    const productData: any = {};

    const fields = [
      "name",
      "shortDescription",
      "description",
      "price",
      "wholesalePrice",
      "stock",
      "weight",
      "weightUnit",
      "type",
      "categoryId",
      "subcategoryId",
    ];

    fields.forEach((field) => {
      if (formData.has(field)) {
        const value = formData.get(field) as string;
        if (["price", "wholesalePrice", "weight"].includes(field)) {
          productData[field] = parseFloat(value);
        } else if (field === "stock") {
          productData[field] = parseInt(value);
        } else if (value) {
          productData[field] = value;
        }
      }
    });

    const primaryImageFile = formData.get("primaryImage") as File;
    if (primaryImageFile && primaryImageFile.size > 0) {
      const buffer = Buffer.from(await primaryImageFile.arrayBuffer());
      const uploadResult = await uploadToCloudinary(buffer);
      productData.image = uploadResult.secure_url;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: productData,
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update product", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: প্রোডাক্ট আর্কাইভ
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await context.params;
    await prisma.product.update({
      where: { id: productId },
      data: { status: ProductStatus.ARCHIVED },
    });
    return NextResponse.json({ message: "Product archived successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to archive product" },
      { status: 500 }
    );
  }
}

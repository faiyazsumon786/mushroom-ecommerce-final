// src/app/api/upload/image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Upload stream to Cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: "editor_images", resource_type: "image" },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve(result);
        }
      );
      upload.end(buffer);
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      folder: uploadResult.folder,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  }
}

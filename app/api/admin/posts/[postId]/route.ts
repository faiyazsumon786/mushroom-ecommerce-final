// src/app/api/admin/posts/[postId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Helper: Upload image to Cloudinary
import type { UploadApiResponse } from "cloudinary";

async function uploadImageToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "blog_images", resource_type: "image" }, (err, result) => {
        if (err || !result) reject(err);
        else resolve(result as UploadApiResponse);
      })
      .end(buffer);
  });
}

// GET single post
export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const postId = params.postId;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { products: true, author: true },
    });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    console.error("GET post error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PUT update post (supports FormData + optional image)
export async function PUT(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role;

    if (!session || (userRole !== "ADMIN" && userRole !== "EMPLOYEE")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const postId = params.postId;

    // ✅ Check if request is FormData (file upload)
    const contentType = request.headers.get("content-type") || "";
    let title = "";
    let content = "";
    let status: string = "DRAFT";
    let productIds: string[] = [];
    let featuredImageBase64: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = (formData.get("title") as string) || "";
      content = (formData.get("content") as string) || "";
      status = (formData.get("status") as string) || "DRAFT";
      productIds = formData.getAll("productIds") as string[];

      const featuredFile = formData.get("featuredImage") as File | null;
      if (featuredFile && featuredFile.size > 0) {
        const buffer = Buffer.from(await featuredFile.arrayBuffer());
        const uploadResult = await uploadImageToCloudinary(buffer);
        featuredImageBase64 = uploadResult.secure_url;
      }
    } else {
      const data = await request.json();
      title = data.title;
      content = data.content;
      status = data.status;
      productIds = data.productIds || [];
      featuredImageBase64 = data.featuredImageBase64;
      if (featuredImageBase64) {
        const buffer = Buffer.from(featuredImageBase64, "base64");
        const uploadResult = await uploadImageToCloudinary(buffer);
        featuredImageBase64 = uploadResult.secure_url;
      }
    }

    const updateData: {
      title: string;
      content: string;
      status: string;
      products: { set: { id: string }[] };
      featuredImageUrl?: string;
    } = {
      title,
      content,
      status,
      products: { set: productIds.map((id) => ({ id })) },
    };

    if (featuredImageBase64) updateData.featuredImageUrl = featuredImageBase64;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: { products: true, author: true },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("PUT post error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE post
export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role;

    if (!session || (userRole !== "ADMIN" && userRole !== "EMPLOYEE")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const postId = params.postId;
    await prisma.post.delete({ where: { id: postId } });
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("DELETE post error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}


// // app/api/admin/posts/[postId]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { v2 as cloudinary } from "cloudinary";

// // Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// // Helper: Upload image to Cloudinary
// import type { UploadApiResponse } from "cloudinary";

// async function uploadImageToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload_stream({ folder: "blog_images", resource_type: "image" }, (err, result) => {
//       if (err || !result) reject(err);
//       else resolve(result as UploadApiResponse);
//     }).end(buffer);
//   });
// }

// // GET post
// export async function GET(req: NextRequest, context: { params: { postId: string } }) {
//   try {
//     const { postId } = await context.params;
//     const post = await prisma.post.findUnique({
//       where: { id: postId },
//       include: { products: true, author: true },
//     });
//     if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
//     return NextResponse.json(post);
//   } catch (error) {
//     console.error("GET post error:", error);
//     return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
//   }
// }

// // PUT post
// export async function PUT(req: NextRequest, context: { params: { postId: string } }) {
//   try {
//     const session = await getServerSession(authOptions);
//     const userRole = session?.user?.role;
//     if (!session || (userRole !== "ADMIN" && userRole !== "EMPLOYEE")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
//     }

//     const { postId } = await context.params;

//     const formData = await req.formData();
//     const title = formData.get("title") as string;
//     const content = formData.get("content") as string;
//     const status = formData.get("status") as string;
//     const productIds = formData.getAll("productIds") as string[];

//     let featuredImageUrl: string | undefined;
//     const file = formData.get("featuredImage") as File | null;
//     if (file) {
//       const arrayBuffer = await file.arrayBuffer();
//       const buffer = Buffer.from(arrayBuffer);
//       const uploadResult = await uploadImageToCloudinary(buffer);
//       featuredImageUrl = uploadResult.secure_url;
//     }

//     const updatedPost = await prisma.post.update({
//       where: { id: postId },
//       data: {
//         title,
//         content,
//         status,
//         products: { set: productIds.map((id) => ({ id })) },
//         ...(featuredImageUrl ? { featuredImageUrl } : {}),
//       },
//       include: { products: true, author: true },
//     });

//     return NextResponse.json(updatedPost);
//   } catch (error) {
//     console.error("PUT post error:", error);
//     return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
//   }
// }

// // DELETE post
// export async function DELETE(req: NextRequest, context: { params: { postId: string } }) {
//   try {
//     const session = await getServerSession(authOptions);
//     const userRole = session?.user?.role;
//     if (!session || (userRole !== "ADMIN" && userRole !== "EMPLOYEE")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
//     }

//     const { postId } = await context.params;

//     await prisma.post.delete({ where: { id: postId } });
//     return NextResponse.json({ message: "Post deleted successfully" });
//   } catch (error) {
//     console.error("DELETE post error:", error);
//     return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
//   }
// }

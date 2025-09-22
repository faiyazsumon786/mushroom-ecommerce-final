// app/api/admin/banners/[bannerId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET single banner
export async function GET(
  request: NextRequest,
  context: { params: Record<string, string | undefined> }
) {
  const { bannerId } = context.params;
  if (!bannerId) {
    return NextResponse.json({ error: "Banner ID is missing" }, { status: 400 });
  }

  try {
    const banner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 });
  }
}

// PATCH / update banner
export async function PATCH(
  request: NextRequest,
  context: { params: Record<string, string | undefined> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { bannerId } = context.params;
  if (!bannerId) {
    return NextResponse.json({ error: "Banner ID is missing" }, { status: 400 });
  }

  try {
    const body = await request.json();

    const updatedBanner = await prisma.banner.update({
      where: { id: bannerId },
      data: body, // Make sure body only contains allowed fields
    });

    return NextResponse.json(updatedBanner);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

// DELETE banner
export async function DELETE(
  request: NextRequest,
  context: { params: Record<string, string | undefined> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { bannerId } = context.params;
  if (!bannerId) {
    return NextResponse.json({ error: "Banner ID is missing" }, { status: 400 });
  }

  try {
    await prisma.banner.delete({
      where: { id: bannerId },
    });

    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}

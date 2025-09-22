import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// helper to await params
async function resolveParams<T>(paramsPromise: Promise<T>) {
  return await paramsPromise;
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ bannerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { bannerId } = await resolveParams(context.params);

  if (!bannerId) {
    return NextResponse.json({ error: "Banner ID is missing" }, { status: 400 });
  }

  try {
    await prisma.banner.delete({ where: { id: bannerId } });
    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}

// GET single banner
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bannerId: string }> }
) {
  const { bannerId } = await resolveParams(context.params);
  if (!bannerId) return NextResponse.json({ error: "Banner ID missing" }, { status: 400 });

  const banner = await prisma.banner.findUnique({ where: { id: bannerId } });
  if (!banner) return NextResponse.json({ error: "Banner not found" }, { status: 404 });
  return NextResponse.json(banner);
}

// PATCH / update banner
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ bannerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { bannerId } = await resolveParams(context.params);
  const body = await request.json();

  try {
    const updated = await prisma.banner.update({
      where: { id: bannerId },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

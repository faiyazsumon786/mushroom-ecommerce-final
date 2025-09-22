import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bannerId: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { bannerId } = params;

  if (!bannerId) {
    return NextResponse.json({ error: "Banner ID is missing" }, { status: 400 });
  }

  try {
    await prisma.banner.delete({
      where: { id: bannerId }
    });
    
    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}

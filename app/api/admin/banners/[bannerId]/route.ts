import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper function to get the ID from the URL
const getBannerId = (request: NextRequest) => {
    const url = new URL(request.url);
    return url.pathname.split('/').pop();
};

// DELETE banner
export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const bannerId = getBannerId(request);
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
export async function GET(request: NextRequest) {
    const bannerId = getBannerId(request);
    if (!bannerId) {
        return NextResponse.json({ error: "Banner ID missing" }, { status: 400 });
    }

    try {
        const banner = await prisma.banner.findUnique({ where: { id: bannerId } });
        if (!banner) {
            return NextResponse.json({ error: "Banner not found" }, { status: 404 });
        }
        return NextResponse.json(banner);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 });
    }
}

// PATCH / update banner
export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const bannerId = getBannerId(request);
    if (!bannerId) {
        return NextResponse.json({ error: "Banner ID is missing" }, { status: 400 });
    }

    try {
        const body = await request.json();
        const updated = await prisma.banner.update({
            where: { id: bannerId },
            data: body,
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
    }
}
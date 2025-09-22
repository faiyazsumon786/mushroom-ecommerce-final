import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Get the messageId directly from the URL
        const url = new URL(request.url);
        const messageId = url.pathname.split('/').pop();

        if (!messageId) {
            return NextResponse.json({ error: "Message ID is missing" }, { status: 400 });
        }

        await prisma.contactMessage.update({
            where: { id: messageId },
            data: { isRead: true }
        });
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update message status" }, { status: 500 });
    }
}
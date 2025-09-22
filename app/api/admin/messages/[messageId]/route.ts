// src/app/api/admin/messages/[messageId]/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { messageId: string } }
) {
    try {
        await prisma.contactMessage.update({
            where: { id: params.messageId },
            data: { isRead: true }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update message status" }, { status: 500 });
    }
}
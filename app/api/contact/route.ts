// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { name, email, subject, message } = await request.json();
        if (!name || !email || !message) {
            return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
        }

        await prisma.contactMessage.create({
            data: { name, email, subject, message }
        });

        return NextResponse.json({ success: "Message sent successfully!" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
    }
}
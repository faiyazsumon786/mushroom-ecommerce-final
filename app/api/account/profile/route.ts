import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// লগইন করা গ্রাহকের প্রোফাইল তথ্য আপডেট করার জন্য
export async function PUT(request: NextRequest) {
    // প্রথমে, সেশন থেকে ব্যবহারকারী লগইন করা আছে কিনা তা চেক করা হচ্ছে
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // ফর্ম থেকে পাঠানো নতুন তথ্যগুলো নেওয়া হচ্ছে
        const body = await request.json();
        const { name, phone, address, city, postalCode } = body;

        // ডাটাবেসে শুধুমাত্র লগইন করা ব্যবহারকারীর তথ্য আপডেট করা হচ্ছে
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                phone,
                address,
                city,
                postalCode,
            },
        });

        // সফলভাবে আপডেট হওয়ার পর, নতুন তথ্য ফেরত পাঠানো হচ্ছে
        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CartItem } from "@/lib/cartStore"; // কার্ট আইটেমের টাইপ ইম্পোর্ট করা হচ্ছে

// একটি নতুন অর্ডার তৈরি করার জন্য
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            customerName,
            customerPhone,
            shippingAddress,
            deliveryMethod,
            paymentMethod,
            items, // কার্ট থেকে আসা প্রোডাক্টগুলো
        } = body;

        if (!customerName || !customerPhone || !shippingAddress || !deliveryMethod || !paymentMethod || !items || items.length === 0) {
            return NextResponse.json({ error: "All fields are required and cart cannot be empty." }, { status: 400 });
        }

        // সার্ভার সাইডে ডেলিভারি খরচ এবং মোট মূল্য গণনা করা হচ্ছে (নিরাপত্তার জন্য)
        const deliveryCost = deliveryMethod === 'INSIDE_DHAKA' ? 70 : 130;
        
        // সার্ভার সাইডে প্রোডাক্টের দাম যাচাই করা হচ্ছে
        const productIds = items.map((item: CartItem) => item.id);
        const productsFromDb = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        const subtotal = items.reduce((acc: number, item: CartItem) => {
            const product = productsFromDb.find(p => p.id === item.id);
            if (!product) throw new Error(`Product with id ${item.id} not found.`);
            return acc + product.price * item.quantity;
        }, 0);
        
        const totalAmount = subtotal + deliveryCost;

        // ডাটাবেসে নতুন অর্ডার তৈরি করা হচ্ছে
        const newOrder = await prisma.order.create({
            data: {
                userId: session.user.id,
                customerName,
                customerPhone,
                shippingAddress,
                deliveryMethod,
                paymentMethod,
                deliveryCost,
                totalAmount,
                orderItems: {
                    create: items.map((item: CartItem) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: productsFromDb.find(p => p.id === item.id)!.price,
                    })),
                },
            },
            include: {
                orderItems: true, // তৈরি হওয়া অর্ডার আইটেমগুলোও ফেরত পাঠানো হচ্ছে
            },
        });

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error: unknown) {
        console.error("Order creation failed:", error);
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : "Unknown error";
        return NextResponse.json({ error: "Failed to create order.", details: errorMessage }, { status: 500 });
    }
}
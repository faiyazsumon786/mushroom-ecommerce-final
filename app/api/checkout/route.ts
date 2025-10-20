import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // <-- ✅ সঠিক Prisma Client ইম্পোর্ট করা হয়েছে
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CartItem } from '@/lib/cartStore';
import { DeliveryMethod, PaymentMethod } from '@prisma/client';

// ❌ পুরনো new PrismaClient() মুছে ফেলা হয়েছে

// একটি নতুন অর্ডার তৈরি করার জন্য চূড়ান্ত API
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    try {
        // ✅ সরাসরি প্রধান খাম থেকে সব তথ্য নেওয়া হচ্ছে
        const body = await request.json();
        const {
            customerName,
            customerPhone,
            shippingAddress,
            deliveryMethod,
            paymentMethod,
            items,
        } = body;

        if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        // সার্ভার সাইডে ডেলিভারি খরচ এবং মোট মূল্য গণনা করা হচ্ছে (নিরাপত্তার জন্য)
        const deliveryCost = deliveryMethod === 'INSIDE_DHAKA' ? 70 : 130;
        
        const productIds = items.map((item: CartItem) => item.id);
        const productsFromDb = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        const subtotal = items.reduce((acc: number, item: CartItem) => {
            const product = productsFromDb.find(p => p.id === item.id);
            if (!product) throw new Error(`Product ${item.name} not found in database.`);
            return acc + product.price * item.quantity;
        }, 0);
        
        const totalAmount = subtotal + deliveryCost;

        // ডাটাবেসে নতুন অর্ডার তৈরি করা হচ্ছে
        const newOrder = await prisma.order.create({
            data: {
                userId: session.user.id,
                totalAmount,
                deliveryCost,
                deliveryMethod: deliveryMethod as DeliveryMethod,
                paymentMethod: paymentMethod as PaymentMethod,
                customerName,         // <-- সরাসরি `customerName` ব্যবহার করা হচ্ছে
                shippingAddress,      // <-- সরাসরি `shippingAddress` ব্যবহার করা হচ্ছে
                customerPhone,        // <-- সরাসরি `customerPhone` ব্যবহার করা হচ্ছে
                orderItems: {
                    create: items.map((item: CartItem) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: productsFromDb.find(p => p.id === item.id)!.price,
                    })),
                },
            },
        });

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error: any) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: "Failed to create order.", details: error.message }, { status: 500 });
    }
}
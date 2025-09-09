// src/app/(ecommerce)/order-confirmation/[orderId]/page.tsx
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { format } from 'date-fns'; // date-fns ইম্পোর্ট করুন

const prisma = new PrismaClient();

async function getOrder(id: string) {
  return await prisma.order.findUnique({ where: { id } });
}

export default async function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  const order = await getOrder(params.orderId);

  if (!order) {
    return <div className="text-center p-12">Order not found!</div>;
  }

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-4">Thank You!</h1>
      <p className="text-xl text-gray-700">Your order has been placed successfully.</p>
      
      <div className="mt-6 bg-gray-50 inline-block p-6 rounded-lg border">
        <p className="text-gray-600">Order Number: <span className="font-bold text-lg text-gray-800">#{order.orderNumber}</span></p>
        <p className="text-gray-600">Order Date: <span className="font-semibold text-gray-800">{format(new Date(order.createdAt), 'dd MMMM, yyyy')}</span></p>
      </div>

      <div className="mt-8">
        <Link href="/" className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
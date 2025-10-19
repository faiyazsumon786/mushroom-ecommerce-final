import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatCurrency } from '@/lib/formatCurrency';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

<<<<<<< HEAD
// ✅ সঠিক টাইপ ডিফাইন
interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
  });
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  // ✅ Promise resolve করা হচ্ছে
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto text-center py-20">
      <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
      <h1 className="mt-6 text-4xl font-serif font-bold text-dark">
        Thank You For Your Order!
      </h1>
      <p className="mt-4 text-gray-600">
        Your order #{order.orderNumber} has been placed successfully.
      </p>
      <p className="text-gray-600">
        We have sent a confirmation to your email. You will be notified once it ships.
      </p>

      <div className="mt-10 max-w-md mx-auto border rounded-lg p-6 space-y-4 text-left">
        <h3 className="font-bold text-lg">Order Summary</h3>
        <div className="flex justify-between">
          <span>Total Amount:</span>
          <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping to:</span>
          <span className="font-semibold">{order.shippingAddress}</span>
        </div>
      </div>

      <Link href="/products" className="mt-8 inline-block">
        <Button size="lg">Continue Shopping</Button>
      </Link>
    </div>
  );
}
=======
// Define a specific type for the page's props
type OrderConfirmationPageProps = {
    params: {
        orderId: string;
    };
};

async function getOrder(id: string) {
    return prisma.order.findUnique({
        where: { id },
    });
}

// Use the newly defined type for the component's props
export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
    const order = await getOrder(params.orderId);

    if (!order) {
        notFound();
    }

    return (
        <div className="container mx-auto text-center py-20">
            <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
            <h1 className="mt-6 text-4xl font-serif font-bold text-dark">Thank You For Your Order!</h1>
            <p className="mt-4 text-gray-600">Your order #{order.orderNumber} has been placed successfully.</p>
            <p className="text-gray-600">We have sent a confirmation to your email. You will be notified once it ships.</p>

            <div className="mt-10 max-w-md mx-auto border rounded-lg p-6 space-y-4 text-left bg-white">
                <h3 className="font-bold text-lg">Order Summary</h3>
                <div className="flex justify-between">
                    <span>Order Number:</span>
                    <span className="font-semibold">#{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping to:</span>
                    <span className="font-semibold">{order.shippingAddress}</span>
                </div>
            </div>
            
            <Link href="/products" className="mt-8 inline-block">
                <Button size="lg">Continue Shopping</Button>
            </Link>
        </div>
    );
}
>>>>>>> 16c5c8d7ca3a7cc4a118acc9a5632b56a593452f

import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';
import Image from 'next/image';
import PrintButton from '@/components/PrintButton'; // কম্পোনেন্টটি ইম্পোর্ট করুন
import { formatCurrency } from '@/lib/formatCurrency'; // কারেন্সি ফরম্যাটার ইম্পোর্ট করুন

const prisma = new PrismaClient();

async function getOrderForInvoice(id: string) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      orderItems: {
        include: { product: true },
      },
      payment: true,
    },
  });
}

// FIX: Correctly typed props
interface InvoicePageProps {
  params: { orderId: string };
}

export default async function InvoicePage({ params }: any) {
  const order = await getOrderForInvoice(params.orderId);

  if (!order) {
    return <div className="p-8 text-center text-red-600">Invoice not found for this order.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-12 p-10 bg-white rounded-lg shadow-2xl font-sans">
      {/* ইনভয়েসের হেডার */}
      <header className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">INVOICE</h1>
          <p className="text-gray-500 mt-1">Order #{order.orderNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-700">🍄 Mushroom LOTA</h2>
          <p className="text-sm text-gray-500">Dhaka, Bangladesh</p>
        </div>
      </header>

      {/* গ্রাহক এবং অর্ডারের তথ্য */}
      <section className="grid grid-cols-2 gap-8 my-8">
        <div>
          <h3 className="font-semibold text-gray-500 uppercase tracking-wider mb-2 text-sm">Billed To</h3>
          <p className="font-bold text-lg text-gray-800">{order.customerName}</p>
          <p className="text-gray-600">{order.shippingAddress}</p>
          <p className="text-gray-600">{order.customerPhone}</p>
        </div>
        <div className="text-right">
          <h3 className="font-semibold text-gray-500 uppercase tracking-wider mb-2 text-sm">Details</h3>
          <p className="text-gray-700"><strong>Order Date:</strong> {format(new Date(order.createdAt), 'dd MMMM, yyyy')}</p>
          <p className="text-gray-700"><strong>Payment Status:</strong> 
              <span className={`font-semibold ${order.payment?.status === 'PAID' ? 'text-green-600' : 'text-red-600'}`}>
                  {order.payment?.status || 'DUE'}
              </span>
          </p>
        </div>
      </section>

      {/* প্রোডাক্টের তালিকা */}
      <section className="mt-10">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Product</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-center">Quantity</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Unit Price</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.orderItems.map(item => (
              <tr key={item.id}>
                <td className="p-4 text-gray-600">{item.product.name}</td>
                <td className="p-4 text-gray-600 text-center">{item.quantity}</td>
                <td className="p-4 text-gray-600 text-right">{formatCurrency(item.price)}</td>
                <td className="p-4 text-gray-600 text-right font-semibold">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* মোট টাকার হিসাব */}
      <section className="flex justify-end mt-8">
        <div className="w-full max-w-sm space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping:</span>
            <span>{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-800 border-t-2 border-gray-200 pt-3 mt-2">
            <span>Total Amount:</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </section>

      {/* ফুটার এবং প্রিন্ট বাটন */}
      <footer className="text-center mt-12 pt-6 border-t">
        <div className="flex justify-center">
          <PrintButton />
        </div>
        <p className="text-xs text-gray-500 mt-4">Thank you for your order!</p>
      </footer>
    </div>
  );
}
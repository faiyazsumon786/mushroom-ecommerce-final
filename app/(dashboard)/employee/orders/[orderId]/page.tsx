import { PrismaClient, OrderStatus } from '@prisma/client';
import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';
import UpdateOrderStatus from '../components/UpdateOrderStatus';
import { formatCurrency } from '@/lib/formatCurrency'; // কারেন্সি ফরম্যাটার ইম্পোর্ট করুন
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

async function getOrderDetails(id: string) {
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

export default async function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  // getServerSession(authOptions) is not strictly needed here if middleware protects the route,
  // but it's good practice for Server Components that rely on session data.
  const session = await getServerSession(authOptions);
  if (!session) {
      return <div className="p-8 font-semibold text-red-600">Please log in to view this page.</div>;
  }
  
  const order = await getOrderDetails(params.orderId);

  if (!order) {
    return <div className="p-8 font-semibold text-red-600">Order not found.</div>;
  }

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPED: return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-900">Order Details</h1>
        <span className="font-semibold">Order #{order.orderNumber}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h2 className="text-2xl font-semibold mb-4">Products in this Order</h2>
            <ul className="divide-y divide-gray-200">
              {order.orderItems.map(item => (
                <li key={item.id} className="flex items-center py-4">
                  <Image src={item.product.image} alt={item.product.name} width={64} height={64} className="rounded-md mr-4 object-cover" />
                  <div className="flex-grow">
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border self-start">
          <h2 className="text-2xl font-semibold mb-4">Summary</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-600">Customer Details</h3>
              <p>{order.customerName}</p>
              <p className="text-sm text-gray-500">{order.user.email}</p>
              <p className="text-sm text-gray-500">{order.customerPhone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-600">Shipping Address</h3>
              <p>{order.shippingAddress}</p>
            </div>
            <div className="border-t pt-4">
              <p><strong>Order Date:</strong> {format(new Date(order.createdAt), 'dd MMM yyyy')}</p>
              <p className="font-semibold mt-2">
                Status: <span className={`px-3 py-1 text-xs rounded-full ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-4">
                Total: {formatCurrency(order.totalAmount)}
              </p>
            </div>

            <Link 
              href={`/invoice/${order.id}`} 
              target="_blank" 
              className="w-full block text-center bg-gray-700 text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Print Invoice
            </Link>
            
            <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
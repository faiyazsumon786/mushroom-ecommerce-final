// src/app/(dashboard)/employee/orders/page.tsx
import { PrismaClient, Order, User, OrderItem, Product, OrderStatus } from '@prisma/client';
import { format } from 'date-fns';
import Link from 'next/link'; // Link ইম্পোর্ট করুন

const prisma = new PrismaClient();

// এই ফাংশনটি ডাটাবেস থেকে সব অর্ডার নিয়ে আসে
async function getOrders() {
  return await prisma.order.findMany({
    include: {
      user: true, // গ্রাহকের তথ্যসহ
    },
    orderBy: { createdAt: 'desc' },
  });
}

// স্ট্যাটাস অনুযায়ী ব্যাজের রঙ নির্ধারণ করার জন্য
const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
        case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
        case 'DELIVERED': return 'bg-green-100 text-green-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Order Management</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">All Customer Orders</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-lg">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left bg-white border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-600 uppercase text-sm">
                  <th className="py-3 px-4 font-semibold">Order #</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-base">
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">#{order.orderNumber}</td>
                    <td className="py-3 px-4">{order.customerName}</td>
                    <td className="py-3 px-4">{format(new Date(order.createdAt), 'dd MMM, yyyy')}</td>
                    <td className="py-3 px-4">{order.totalAmount.toFixed(2)} BDT</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/employee/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
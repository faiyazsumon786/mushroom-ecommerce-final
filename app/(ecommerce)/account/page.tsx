import { PrismaClient, OrderStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { format } from 'date-fns';
// import Link from 'next/link';  <-- মুছে ফেলো যদি ব্যবহার না করো

const prisma = new PrismaClient();

async function getMyOrders(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return <div>Please log in to view your account.</div>;
  }
  
  const orders = await getMyOrders(session.user.id);
  
  // স্ট্যাটাস অনুযায়ী ব্যাজের রঙ নির্ধারণ
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">My Account</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-semibold mb-5">My Order History</h2>
        {orders.length === 0 ? (
          <p>You have not placed any orders yet.</p>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Order ID</th>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Total Amount</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b">
                  <td className="py-3 px-4 font-mono text-sm">{order.id.slice(-12)}</td>
                  <td className="py-3 px-4">{format(new Date(order.createdAt), 'dd MMM yyyy')}</td>
                  <td className="py-3 px-4">${order.totalAmount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
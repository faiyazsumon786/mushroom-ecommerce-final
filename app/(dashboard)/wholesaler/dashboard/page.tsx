// src/app/(dashboard)/wholesaler/dashboard/page.tsx
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { FaShoppingCart, FaBox, FaMoneyBillWave } from 'react-icons/fa';

const prisma = new PrismaClient();

async function getWholesalerStats(userId: string) {
  // FIX: aggregate instead of findMany for due payments
  const [purchaseCount, dueOrders] = await Promise.all([
    prisma.order.count({
      where: { userId: userId },
    }),
    prisma.order.findMany({
      where: {
        userId: userId,
        payment: { // This nested query now works
          status: 'DUE',
        },
      },
    }),
  ]);

  // Use reduce to safely calculate the total from the fetched orders
  const totalDue = dueOrders.reduce((acc, order) => acc + order.totalAmount, 0);

  return { purchaseCount, totalDue };
}


export default async function WholesalerDashboardPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return <div>Please log in.</div>;
  }

  const { purchaseCount, totalDue } = await getWholesalerStats(session.user.id);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">My Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for Cart Items */}
        <div className="bg-white p-6 rounded-xl shadow-lg border flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100"><FaShoppingCart className="text-2xl text-blue-500" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Items in Cart</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>
        </div>
        {/* Total Purchases */}
        <div className="bg-white p-6 rounded-xl shadow-lg border flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100"><FaBox className="text-2xl text-green-500" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-800">{purchaseCount}</p>
            </div>
        </div>
        {/* Due Payments */}
        <div className="bg-white p-6 rounded-xl shadow-lg border flex items-center space-x-4">
            <div className="p-3 rounded-full bg-red-100"><FaMoneyBillWave className="text-2xl text-red-500" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Due</p>
              <p className="text-2xl font-bold text-gray-800">${totalDue.toFixed(2)}</p>
            </div>
        </div>
      </div>
    </div>
  );
}
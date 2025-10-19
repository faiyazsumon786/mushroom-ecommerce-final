// src/app/(dashboard)/admin/page.tsx
import { PrismaClient, OrderStatus } from '@prisma/client';
import { FaUsers, FaBoxOpen, FaClipboardList, FaDollarSign } from 'react-icons/fa';



const prisma = new PrismaClient();

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Data fetching function
async function getDashboardStats() {
  // Fetch all data in parallel for better performance
  const [userCount, productCount, pendingOrderCount, revenueData] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        // Assuming 'DELIVERED' status means revenue is earned
        status: OrderStatus.DELIVERED,
      },
    }),
  ]);

  const totalRevenue = revenueData._sum.totalAmount || 0;

  return { userCount, productCount, pendingOrderCount, totalRevenue };
}

// The main async page component
export default async function AdminDashboardPage() {
  const { userCount, productCount, pendingOrderCount, totalRevenue } = await getDashboardStats();

  const stats = [
    { title: 'Total Users', value: userCount, icon: <FaUsers className="text-blue-500" />, color: 'blue' },
    { title: 'Total Products', value: productCount, icon: <FaBoxOpen className="text-green-500" />, color: 'green' },
    { title: 'Pending Orders', value: pendingOrderCount, icon: <FaClipboardList className="text-yellow-500" />, color: 'yellow' },
    { title: 'Total Revenue', value: formatCurrency(totalRevenue), icon: <FaDollarSign className="text-red-500" />, color: 'red' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-${stat.color}-100`}>
              <div className="text-2xl">{stat.icon}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* You can add more sections here, like recent orders or charts */}
    </div>
  );
}
// src/app/(dashboard)/supplier/stock/page.tsx
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import SuggestProductModal from '../components/SuggestProductModal';
import { authOptions } from '@/lib/auth';// <-- এই লাইনটি যোগ করুন

const prisma = new PrismaClient();

async function getSupplierData(userId: string) {
  const supplierProfile = await prisma.supplierProfile.findUnique({
    where: { userId: userId },
  });
  if (!supplierProfile) {
    return [];
  }
  const products = await prisma.product.findMany({
  include: { category: true },
  orderBy: { name: 'asc' },
});
  return products;
}

export default async function SupplierStockPage() {
  const session = await getServerSession(authOptions); // <-- এখানে authOptions যোগ করুন

  if (!session?.user?.id) {
    return <div className="p-8 font-semibold text-red-600">Please log in to view this page.</div>;
  }

  const products = await getSupplierData(session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-900">My Product Stock</h1>
        <SuggestProductModal />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">My Supplied Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left bg-white">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-4 font-semibold">Image</th>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Current Stock</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    You have not supplied any products yet.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold">{product.name}</td>
                    <td className="py-3 px-4">{product.category.name}</td>
                    <td className="py-3 px-4 text-lg font-bold">{product.stock}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'LIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
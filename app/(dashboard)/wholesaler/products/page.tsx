// src/app/(dashboard)/wholesaler/products/page.tsx
import { PrismaClient } from '@prisma/client';
import WholesaleProductCard from '../components/WholesaleProductCard';

const prisma = new PrismaClient();

async function getProducts() {
  return await prisma.product.findMany({
    where: { status: 'LIVE' }, // Only show live products
    orderBy: { createdAt: 'desc' },
  });
}

export default async function WholesaleProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Wholesale Products</h1>
      <p className="text-lg text-gray-600">
        Browse our collection available for wholesale purchasing.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <WholesaleProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
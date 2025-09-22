// src/app/(dashboard)/admin/products/page.tsx
import { Product, Category, User } from '@prisma/client';
import ProductTable from '../components/ProductTable';
import AddProductModal from '../components/AddProductModal';
import prisma from '@/lib/prisma'; // PrismaClient singleton import

// সম্পর্কিত সব তথ্যসহ একটি নতুন টাইপ
type FullProduct = Product & {
  category: Category;
  createdBy: User;
};

// সম্পর্কিত সব তথ্যসহ প্রোডাক্ট নিয়ে আসার ফাংশন
async function getProducts(): Promise<FullProduct[]> {
  return await prisma.product.findMany({
    include: {
      category: true,
      createdBy: true, // যে user created করেছে
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-900">Product Management</h1>
        <AddProductModal />
      </div>
      <ProductTable products={products} />
    </div>
  );
}

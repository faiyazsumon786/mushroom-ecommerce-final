// src/app/(dashboard)/admin/products/page.tsx
import { PrismaClient, Product, Category, SupplierProfile, User } from '@prisma/client';
import ProductTable from '../components/ProductTable';
import AddProductModal from '../components/AddProductModal';

const prisma = new PrismaClient();

// সঠিক টাইপ ডিফাইন করা হয়েছে
type FullProduct = Product & {
  category: Category;
  supplier: SupplierProfile & { user: User };
};

// সম্পর্কিত সব তথ্যসহ প্রোডাক্ট নিয়ে আসার ফাংশন
async function getProducts(): Promise<FullProduct[]> {
  return await prisma.product.findMany({
    include: {
      category: true,
      supplier: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
  }) as FullProduct[];
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-900">Product Management</h1>
        <AddProductModal />
      </div>
      {/* এখানে আর 'as any' ব্যবহার করার প্রয়োজন নেই */}
      <ProductTable products={products} />
    </div>
  );
}
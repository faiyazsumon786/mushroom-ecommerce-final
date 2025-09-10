// src/app/(dashboard)/admin/products/page.tsx
import { PrismaClient, Product, Category, User } from '@prisma/client';
import ProductTable from '../components/ProductTable';
import AddProductModal from '../components/AddProductModal';

const prisma = new PrismaClient();

// সম্পর্কিত সব তথ্যসহ একটি নতুন এবং সঠিক টাইপ
type FullProduct = Product & {
  category: Category;
  createdBy: User; // We fetch the user who created the product
};

// সম্পর্কিত সব তথ্যসহ প্রোডাক্ট নিয়ে আসার সঠিক ফাংশন
async function getProducts(): Promise<FullProduct[]> {
  return await prisma.product.findMany({
    include: {
      category: true,
      createdBy: true, // supplier এর পরিবর্তে createdBy আনা হচ্ছে
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
      <ProductTable products={products} />
    </div>
  );
}
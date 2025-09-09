// src/app/(dashboard)/admin/products/page.tsx
import { PrismaClient, Product, Category, SupplierProfile, User } from '@prisma/client';
import ProductTable from '../components/ProductTable';
import AddProductModal from '../components/AddProductModal'; // Import the new modal component

const prisma = new PrismaClient();

type FullProduct = Product & {
  category: Category;
  supplier: SupplierProfile & { user: User };
};

async function getProducts(): Promise<FullProduct[]> {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      supplier: {
        include: { user: true }
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return products as FullProduct[];
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-900">Product Management</h1>
        <AddProductModal /> {/* Place the modal button here */}
      </div>
      
      <ProductTable products={products} />
    </div>
  );
}
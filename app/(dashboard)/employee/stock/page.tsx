import { PrismaClient } from '@prisma/client';
import StockEntryForm from '../../admin/components/StockEntryForm';

const prisma = new PrismaClient();

async function getFormData() {
  const [suppliers, products] = await Promise.all([
    prisma.supplierProfile.findMany({
      include: { user: true }, // supplier এর ইউজার ডিটেইলস নিয়ে আসা
    }),
    prisma.product.findMany({
      select: { id: true, name: true }, // শুধু প্রয়োজনীয় ফিল্ড
    }),
  ]);
  return { suppliers, products };
}

export default async function StockPage() {
  const { suppliers, products } = await getFormData();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Receive Incoming Stock</h1>
      <p className="text-lg text-gray-600">
        Use this form to record new stock received from a supplier. This will automatically update the product inventory.
      </p>
      <StockEntryForm suppliers={suppliers} products={products} />
    </div>
  );
}
import { PrismaClient, PaymentStatus, SupplierPayment, SupplierProfile, User, StockEntry, Product } from '@prisma/client';
import { format } from 'date-fns';
import PaymentActions from '../components/PaymentActions';

const prisma = new PrismaClient();

// সম্পর্কিত সব তথ্যসহ একটি নতুন টাইপ তৈরি করা হয়েছে
type PaymentWithRelations = SupplierPayment & {
  supplier: SupplierProfile & { user: User };
  stockEntry: StockEntry & { product: Product };
};

// ফাংশনটিকে বলা হয়েছে যেন সে সম্পর্কিত সব তথ্য নিয়ে আসে
async function getSupplierPayments(): Promise<PaymentWithRelations[]> {
  return prisma.supplierPayment.findMany({
    include: {
      supplier: { include: { user: true } },
      stockEntry: { include: { product: true } }, // এই include অংশটি যোগ করা হয়েছে
    },
    orderBy: { createdAt: 'desc' },
  }) as any; // Using 'as any' to bypass complex type inference issues for now
}

export default async function SupplierPaymentsPage() {
  const payments = await getSupplierPayments();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Supplier Payments</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-semibold mb-5">Payment Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">For Product</th>
                <th className="py-3 px-4">Date Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{payment.supplier.user.name}</td>
                  <td className="py-3 px-4 font-semibold">{payment.amount.toFixed(2)} BDT</td>
                  <td className="py-3 px-4">{payment.stockEntry.product.name} (Qty: {payment.stockEntry.quantity})</td>
                  <td className="py-3 px-4">{format(new Date(payment.createdAt), 'dd MMM yyyy')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'DUE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>{payment.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    {payment.status === 'DUE' && (
                      <PaymentActions paymentId={payment.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
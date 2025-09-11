import { PrismaClient, SupplierPayment, SupplierProfile, User, Shipment, ShipmentItem, SupplierProduct } from '@prisma/client';
import { format } from 'date-fns';
import PaymentActions from '../components/PaymentActions';


const prisma = new PrismaClient();

// সম্পর্কিত সব তথ্যসহ একটি নতুন এবং সঠিক টাইপ তৈরি করা হয়েছে
type PaymentWithRelations = SupplierPayment & {
  supplier: SupplierProfile & { user: User };
  shipment: Shipment & {
    items: (ShipmentItem & { supplierProduct: SupplierProduct })[];
  };
};

// ফাংশনটিকে সঠিক পথে ডেটা আনার জন্য আপডেট করা হয়েছে
async function getSupplierPayments(): Promise<PaymentWithRelations[]> {
  return prisma.supplierPayment.findMany({
    include: {
      supplier: { include: { user: true } },
      // সঠিক রিলেশন: shipment, এবং তার ভেতর থেকে items ও supplierProduct
      shipment: {
        include: {
          items: {
            include: {
              supplierProduct: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  }) as any; // Using 'as any' to simplify the complex return type for now
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
                <th className="py-3 px-4">For Shipment</th>
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
                  {/* চালানের প্রথম প্রোডাক্টের নাম দেখানো হচ্ছে */}
                  <td className="py-3 px-4 text-sm">
                    {payment.shipment.items[0]?.supplierProduct.name}
                    {payment.shipment.items.length > 1 ? ` & ${payment.shipment.items.length - 1} more` : ''}
                  </td>
                  <td className="py-3 px-4">{format(new Date(payment.createdAt), 'dd MMM yyyy')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${
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
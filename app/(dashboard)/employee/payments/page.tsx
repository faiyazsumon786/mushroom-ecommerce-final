import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import PaymentActions from '../components/PaymentActions';

type PaymentWithRelations = {
  id: string;
  supplier: { user: { name: string } };
  stockEntry: { product: { name: string }; quantity: number };
  amount: number;
  status: string;
  createdAt: Date;
};

async function getSupplierPayments(): Promise<PaymentWithRelations[]> {
  return prisma.supplierPayment.findMany({
    include: {
      supplier: { include: { user: true } },
      stockEntry: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function SupplierPaymentsPage() {
  const payments = await getSupplierPayments();

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900">Supplier Payments</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
        <h2 className="text-2xl text-green-800 font-semibold mb-6 border-b pb-3">Payment Records</h2>
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 border border-gray-200 text-left text-sm font-medium text-gray-700">Supplier</th>
              <th className="py-3 px-6 border border-gray-200 text-left text-sm font-medium text-gray-700">Amount</th>
              <th className="py-3 px-6 border border-gray-200 text-left text-sm font-medium text-gray-700">For Product</th>
              <th className="py-3 px-6 border border-gray-200 text-left text-sm font-medium text-gray-700">Date Due</th>
              <th className="py-3 px-6 border border-gray-200 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="py-3 px-6 border border-gray-200 text-left text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No payment records found.
                </td>
              </tr>
            )}
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="border border-gray-200 hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-4 px-6 whitespace-nowrap text-gray-900 font-medium">{payment.supplier.user.name}</td>
                <td className="py-4 px-6 whitespace-nowrap font-semibold text-gray-800">${payment.amount.toFixed(2)}</td>
                <td className="py-4 px-6 whitespace-nowrap text-gray-700">
                  {payment.stockEntry.product.name} <span className="text-sm text-gray-500">(Qty: {payment.stockEntry.quantity})</span>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-gray-600">{format(new Date(payment.createdAt), 'dd MMM yyyy')}</td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-md border border-gray-300 ${
                      payment.status === 'DUE'
                        ? 'bg-gradient-to-br from-red-400 to-red-600 text-red-900 shadow-lg'
                        : 'bg-gradient-to-br from-green-400 to-green-600 text-green-900 shadow-lg'
                    }`}
                    style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  {payment.status === 'DUE' ? (
                    <PaymentActions paymentId={payment.id} />
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
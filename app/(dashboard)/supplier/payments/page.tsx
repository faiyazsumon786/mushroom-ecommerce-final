import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { format } from 'date-fns';

const prisma = new PrismaClient();

type PaymentWithRelations = {
  id: string;
  shipmentId: string;
  amount: number;
  status: string;
  createdAt: Date;
};

async function getPaymentHistory(userId: string): Promise<PaymentWithRelations[]> {
  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplierProfile) return [];
  return await prisma.supplierPayment.findMany({
    where: { supplierId: supplierProfile.id },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function PaymentHistoryPage() {
  const session = await getServerSession();
  if (!session?.user?.id) return <div>Please log in.</div>;

  const payments = await getPaymentHistory(session.user.id);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Payment History</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-4">Shipment ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10">No payment records found.</td></tr>
              ) : (
                payments.map((payment: PaymentWithRelations) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{payment.shipmentId.slice(-12)}</td>
                    <td className="py-3 px-4 font-semibold">${payment.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">{format(new Date(payment.createdAt), 'dd MMM yyyy')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'DUE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>{payment.status}</span>
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
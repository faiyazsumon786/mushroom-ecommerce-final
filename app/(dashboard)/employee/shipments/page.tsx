// src/app/(dashboard)/employee/shipments/page.tsx
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';
import ReceiveShipmentButton from '../components/ReceiveShipmentButton';

const prisma = new PrismaClient();

async function getPendingShipments() {
  return await prisma.shipment.findMany({
    where: { status: 'SHIPPED' }, // শুধুমাত্র যে চালানগুলো পাঠানো হয়েছে
    include: {
      supplier: { include: { user: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function IncomingShipmentsPage() {
  const shipments = await getPendingShipments();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Incoming Shipments</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-semibold mb-5">Pending Deliveries</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-4">Shipment ID</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Date Shipped</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                 <tr><td colSpan={6} className="text-center py-10 text-gray-500">No incoming shipments.</td></tr>
              ) : (
                 shipments.map((shipment) => (
                     <tr key={shipment.id} className="border-b hover:bg-gray-50">
                     <td className="py-3 px-4 font-mono text-sm">{shipment.id.slice(-12)}</td>
                     <td className="py-3 px-4">{shipment.supplier.user.name}</td>
                     <td className="py-3 px-4 font-semibold">${shipment.totalValue.toFixed(2)}</td>
                     <td className="py-3 px-4">{shipment.items.length}</td>
                     <td className="py-3 px-4">{format(new Date(shipment.createdAt), 'dd MMM yyyy')}</td>
                     <td className="py-3 px-4">
                         <ReceiveShipmentButton shipmentId={shipment.id} />
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
import { PrismaClient, ShipmentStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { format } from 'date-fns';

const prisma = new PrismaClient();

async function getMyShipments(userId: string) {
  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplierProfile) return [];
  return await prisma.shipment.findMany({
    where: { supplierId: supplierProfile.id },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function MyShipmentsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) return <div className="p-8 text-center text-red-600 font-semibold">Please log in.</div>;

  const shipments = await getMyShipments(session.user.id);

  const getStatusBadgeClass = (status: ShipmentStatus) => {
    if (status === 'RECEIVED') return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800'; // SHIPPED
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">My Shipments</h1>
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Shipment ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date Shipped
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Value
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                      {shipment.id.slice(-12)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {format(new Date(shipment.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      ${shipment.totalValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          getStatusBadgeClass(shipment.status)
                        }`}
                      >
                        {shipment.status.replace('_', ' ')}
                      </span>
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
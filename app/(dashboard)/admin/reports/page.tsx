import prisma from '@/lib/prisma';
import { format } from 'date-fns';

async function getReports() {
  return prisma.dailyReport.findMany({
    include: { employee: true },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function ViewReportsPage() {
  const reports = await getReports();
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Daily Work Reports</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-semibold mb-5">Submitted Reports</h2>
        <div className="space-y-6">
          {reports.length > 0 ? (
            reports.map(report => (
              <div key={report.id} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-lg">{report.employee.name}</p>
                  <p className="text-sm text-gray-500">{format(new Date(report.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{report.reportText}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No reports have been submitted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
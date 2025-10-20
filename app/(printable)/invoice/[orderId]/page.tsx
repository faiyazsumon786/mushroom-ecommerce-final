import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatCurrency } from '@/lib/formatCurrency';
import { format } from 'date-fns';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import PrintButton from '@/components/PrintButton';
import PrintStyles from '@/components/PrintStyles';
import { Suspense } from 'react';

async function getInvoiceData(orderId: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: { include: { product: true } } },
        });

        if (!order) return null;

        const settings = await prisma.siteSetting.findMany();
        const siteSettings = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as Record<string, string>);

        return { order, siteSettings };
    } catch (error) {
        return null;
    }
}

export default async function InvoicePage({ params }: any) {
    const data = await getInvoiceData(params.orderId);

    if (!data) {
        notFound();
    }
    
    const { order, siteSettings } = data;
    const subtotal = order.totalAmount - order.deliveryCost;

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-lg">
                
                <header className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2">
                    <div>
                        {siteSettings.logoUrl ? (
                            <Image src={siteSettings.logoUrl} alt="Company Logo" width={150} height={40} />
                        ) : (
                            <h2 className="text-2xl font-bold text-gray-700">🍄 Zamzam Mushroom</h2>
                        )}
                        <div className="mt-4 text-sm text-gray-500">
                            <p className="font-semibold">{siteSettings.companyName || 'Zamzam Mushroom'}</p>
                            <p>{siteSettings.companyAddress || 'Dhaka, Bangladesh'}</p>
                            <p>{siteSettings.companyPhone || '+8801234567890'}</p>
                        </div>
                    </div>
                    <div className="text-left sm:text-right mt-4 sm:mt-0">
                        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-gray-800">INVOICE</h1>
                        <p className="text-gray-500 mt-1">Order #{order.orderNumber}</p>
                        <Badge className="mt-2 capitalize">{order.status.toLowerCase()}</Badge>
                    </div>
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8">
                    <div>
                        <h3 className="font-semibold text-gray-500 uppercase tracking-wider mb-2 text-sm">Billed To</h3>
                        <p className="font-bold text-lg text-gray-800">{order.customerName}</p>
                        <p className="text-gray-600">{order.shippingAddress}</p>
                        <p className="text-gray-600">{order.customerPhone}</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <h3 className="font-semibold text-gray-500 uppercase tracking-wider mb-2 text-sm">Details</h3>
                        <p className="text-gray-700"><strong>Order Date:</strong> {format(new Date(order.createdAt), 'dd MMMM, yyyy')}</p>
                        <p className="text-gray-700 capitalize"><strong>Payment:</strong> {order.paymentMethod.toLowerCase()}</p>
                    </div>
                </section>

                <section className="mt-10">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Product</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm text-center">Quantity</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Unit Price</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {order.orderItems.map(item => (
                                <tr key={item.id}>
                                    <td className="p-4 text-gray-800 font-medium">{item.product.name}</td>
                                    <td className="p-4 text-gray-600 text-center">{item.quantity}</td>
                                    <td className="p-4 text-gray-600 text-right">{formatCurrency(item.price)}</td>
                                    <td className="p-4 text-gray-800 text-right font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section className="flex justify-end mt-8">
                    <div className="w-full max-w-sm space-y-3 text-gray-700">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(order.deliveryCost)}</span></div>
                        <div className="flex justify-between text-xl font-bold text-dark border-t-2 pt-3 mt-2"><span>Grand Total</span><span>{formatCurrency(order.totalAmount)}</span></div>
                    </div>
                </section>

                <footer className="text-center mt-12 pt-6 border-t">
                    <Suspense fallback={null}>
                        <PrintButton />
                    </Suspense>
                    <p className="text-xs text-gray-500 mt-4">Thank you for your order!</p>
                </footer>
            </div>
            
            <PrintStyles />
        </div>
    );
}
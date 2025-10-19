import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatCurrency";
import { format } from "date-fns";
import Link from "next/link";
import { ShoppingBag, DollarSign, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

// This function fetches all the necessary data for the wholesaler's dashboard
async function getWholesalerData(userId: string) {
    const orders = await prisma.order.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
    });

    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    return {
        orders: orders.slice(0, 5), // Return the 5 most recent orders
        totalSpent,
        totalOrders,
    };
}

export default async function WholesalerDashboard() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        // This should be handled by middleware, but as a safeguard:
        redirect('/login');
    }

    const data = await getWholesalerData(session.user.id);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold">Welcome, {session.user.name}!</h1>
                    <p className="mt-2 text-gray-500">Here is a summary of your wholesale account.</p>
                </div>
                <Link href="/wholesaler/products">
                    <Button size="lg" className="flex items-center gap-2">
                        <span>Start New Order</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalOrders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.totalSpent)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                                    <TableCell>{format(new Date(order.createdAt), 'dd MMM, yyyy')}</TableCell>
                                    <TableCell>{order.status}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
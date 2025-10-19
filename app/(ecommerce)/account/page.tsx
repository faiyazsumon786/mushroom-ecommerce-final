'use client'; // <-- এটিকে Client Component-এ পরিণত করা হয়েছে

import { useSession } from "next-auth/react";
import { useEffect, useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatCurrency";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

type ExtendedUser = {
    name?: string;
    email?: string;
    image?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
};

export default function AccountPage() {
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState([]);
    
    // প্রোফাইল ফর্মের জন্য নতুন state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (session) {
            // সেশন থেকে প্রোফাইল তথ্য লোড করা হচ্ছে
            const user = session.user as ExtendedUser;
            setName(user?.name || '');
            setPhone(user?.phone || '');
            setAddress(user?.address || '');
            setCity(user?.city || '');
            setPostalCode(user?.postalCode || '');

            // ব্যবহারকারীর অর্ডারগুলো fetch করা হচ্ছে
            const fetchOrders = async () => {
                const res = await fetch('/api/orders/my-orders');
                if (res.ok) setOrders(await res.json());
            };
            fetchOrders();
        }
    }, [session]);

    const handleProfileUpdate = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const promise = fetch('/api/account/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, address, city, postalCode }),
        });

        toast.promise(promise, {
            loading: 'Updating profile...',
            success: 'Profile updated successfully!',
            error: 'Failed to update profile.',
        });

        promise.finally(() => setIsSubmitting(false));
    };

    if (status === 'loading') {
        return <div className="text-center py-20">Loading account details...</div>;
    }
    
    if (!session) {
        return <div className="text-center py-20">Please log in to view your account.</div>
    }
    
    const totalSpent = orders.reduce((sum, order: any) => sum + order.totalAmount, 0);

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="font-serif text-4xl font-bold text-dark">My Account</h1>
            <p className="mt-2 text-gray-500">Welcome back, {session.user.name}!</p>

            <div className="mt-8">
                <Tabs defaultValue="dashboard" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="orders">Order History</TabsTrigger>
                        <TabsTrigger value="profile">Edit Profile</TabsTrigger>
                    </TabsList>
                    
                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard" className="mt-6">
                        {/* ... (Dashboard-এর কোড অপরিবর্তিত থাকবে) ... */}
                    </TabsContent>

                    {/* Order History Tab */}
                    <TabsContent value="orders" className="mt-6">
                        {/* ... (Order History-এর কোড অপরিবর্তিত থাকবে) ... */}
                    </TabsContent>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="mt-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Edit Your Information</CardTitle>
                                <CardDescription>Keep your personal and shipping details up to date.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><Label htmlFor="name">Full Name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} /></div>
                                        <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                                    </div>
                                    <div><Label htmlFor="address">Street Address</Label><Input id="address" value={address} onChange={e => setAddress(e.target.value)} /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><Label htmlFor="city">City</Label><Input id="city" value={city} onChange={e => setCity(e.target.value)} /></div>
                                        <div><Label htmlFor="postalCode">Postal Code</Label><Input id="postalCode" value={postalCode} onChange={e => setPostalCode(e.target.value)} /></div>
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
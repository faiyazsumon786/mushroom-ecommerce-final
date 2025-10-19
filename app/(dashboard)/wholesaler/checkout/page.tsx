'use client';

import { useWholesaleCartStore } from '@/lib/wholesaleCartStore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WholesaleCheckoutPage() {
    const { items, clearCart } = useWholesaleCartStore();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // session কে ব্যবহার করলাম এখানে
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user) {
            // console.log('Logged in user:', session.user.name);
        }
    }, [status, session, router]);

    const total = items.reduce((acc, item) => acc + item.wholesalePrice * item.quantity, 0);

    const handlePlaceOrder = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/wholesale-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            });

            if (response.ok) {
                alert('Wholesale order placed successfully!');
                clearCart();
                router.push('/employee/orders');
            } else {
                alert('Failed to place order.');
            }
        } catch (error) {
            console.error('An error occurred:', error);
            alert('An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading' || status === 'unauthenticated') {
        return <p className="text-center p-12">Loading...</p>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-gray-900">Confirm Wholesale Order</h1>
            <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                <ul className="divide-y">
                    {items.map(item => (
                        <li key={item.id} className="py-2 flex justify-between">
                            <span>{item.name} x {item.quantity}</span>
                            <span>${(item.wholesalePrice * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="border-t pt-3 mt-3 flex justify-between text-2xl font-bold">
                    <p>Total</p>
                    <p>${total.toFixed(2)}</p>
                </div>
                <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading || items.length === 0}
                    className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {isLoading ? 'Placing Order...' : 'Place Wholesale Order'}
                </button>
            </div>
        </div>
    );
}
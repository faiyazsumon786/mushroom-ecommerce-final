'use client';
import { useWholesaleCartStore } from '@/lib/wholesaleCartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatCurrency';
import { useEffect, useState } from 'react';

export default function WholesaleCartPage() {
    // We use a local state to prevent hydration errors with the Zustand store
    const [cartItems, setCartItems] = useState<any[]>([]);
    const { items, removeFromCart, updateQuantity } = useWholesaleCartStore();

    useEffect(() => {
        setCartItems(items);
    }, [items]);

    const total = cartItems.reduce((acc, item) => acc + item.wholesalePrice * item.quantity, 0);

    // Check if any item in the cart violates the MOQ rule
    const isCartValid = cartItems.every(item => item.quantity >= item.minWholesaleOrderQuantity);

    if (cartItems.length === 0) {
        return (
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Your Cart is Empty</h1>
                <p className="text-gray-500">Looks like you haven't added any products to your wholesale cart yet.</p>
                <Link href="/wholesaler/products">
                    <Button>Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold">Your Wholesale Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                        <Card key={item.id} className="flex items-center p-4">
                            <div className="relative h-24 w-24 rounded-md overflow-hidden mr-4">
                                <Image src={item.image} alt={item.name} fill className="object-contain" />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-sm text-gray-500">{formatCurrency(item.wholesalePrice)} / unit</p>
                                <p className="text-xs text-gray-500 mt-1">Min. Order: {item.minWholesaleOrderQuantity} units</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="number" 
                                        value={item.quantity} 
                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                        className="w-20 text-center"
                                        min={item.minWholesaleOrderQuantity}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                                {item.quantity < item.minWholesaleOrderQuantity && (
                                    <p className="text-red-500 text-xs font-semibold">
                                        Quantity is below minimum!
                                    </p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 sticky top-24">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between font-semibold">
                                <span>Subtotal</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                            <Button 
                                disabled={!isCartValid || cartItems.length === 0}
                                className="w-full text-lg py-6"
                                asChild
                            >
                                <Link href="/wholesaler/checkout">Proceed to Checkout</Link>
                            </Button>
                            {!isCartValid && (
                                <p className="text-center text-red-600 mt-2 text-sm font-semibold">
                                    Please correct item quantities before proceeding.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
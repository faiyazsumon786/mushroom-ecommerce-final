'use client';
import { useCartStore } from '@/lib/cartStore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency } from '@/lib/formatCurrency';
import Image from 'next/image';
import Link from 'next/link';
import { CreditCard, Truck, Lock, Plus, Minus, X, ShoppingBag } from 'lucide-react';

export default function CheckoutPage() {
    const { items, clearCart, updateQuantity, removeFromCart } = useCartStore();
    const { data: session } = useSession();
    const router = useRouter();
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('INSIDE_DHAKA');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cartItems, setCartItems] = useState(items);

    useEffect(() => {
        setCartItems(items);
        if (session) {
            setName(session.user?.name || '');
            setPhone((session.user as any)?.phone || '');
            setAddress((session.user as any)?.address || '');
        }
    }, [session, items]);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryCost = deliveryMethod === 'INSIDE_DHAKA' ? 70 : 130;
    const total = subtotal + deliveryCost;

    const handlePlaceOrder = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const orderData = {
            customerName: name, customerPhone: phone, shippingAddress: address,
            deliveryMethod, paymentMethod, items: cartItems,
        };

        const promise = fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });

        toast.promise(promise, {
            loading: 'Placing your order...',
            success: async (res) => {
                if (!res.ok) throw new Error('Order placement failed.');
                const newOrder = await res.json();
                clearCart();
                router.push(`/order-confirmation/${newOrder.id}`);
                return 'Order placed successfully!';
            },
            error: 'Could not place your order.',
        });

        promise.finally(() => setIsSubmitting(false));
    };

    if (cartItems.length === 0 && !isSubmitting) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <ShoppingBag className="h-24 w-24 mx-auto text-gray-300" />
                <h1 className="mt-6 text-3xl font-bold font-serif text-dark">Your Cart is Empty</h1>
                <p className="mt-2 text-gray-500">Add some products before you can checkout.</p>
                <Link href="/products" className="mt-8 inline-block">
                    <Button size="lg">Continue Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handlePlaceOrder} className="container mx-auto px-4 py-12">
            <h1 className="font-serif text-4xl font-bold text-center mb-10 text-dark">Complete Your Order</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Shipping & Payment Details */}
                <div className="lg:col-span-2 space-y-8">
                    <Card><CardHeader><CardTitle>1. Shipping Information</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label htmlFor="name">Full Name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required /></div>
                        <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} required /></div>
                        <div><Label htmlFor="address">Full Address</Label><Input id="address" value={address} onChange={e => setAddress(e.target.value)} required /></div>
                    </CardContent></Card>
                    
                    <Card>
                        <CardHeader><CardTitle>2. Delivery Method</CardTitle></CardHeader>
                        <CardContent>
                            <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Label htmlFor="inside_dhaka" className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 cursor-pointer transition-all ${deliveryMethod === 'INSIDE_DHAKA' ? 'border-primary bg-teal-50 shadow-md' : 'border-gray-200'}`}><RadioGroupItem value="INSIDE_DHAKA" id="inside_dhaka" className="sr-only" /><Truck className="mb-3 h-6 w-6 text-primary" />Inside Dhaka<span className="font-bold mt-1">{formatCurrency(70)}</span></Label>
                                <Label htmlFor="outside_dhaka" className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 cursor-pointer transition-all ${deliveryMethod === 'OUTSIDE_DHAKA' ? 'border-primary bg-teal-50 shadow-md' : 'border-gray-200'}`}><RadioGroupItem value="OUTSIDE_DHAKA" id="outside_dhaka" className="sr-only" /><Truck className="mb-3 h-6 w-6 text-primary" />Outside Dhaka<span className="font-bold mt-1">{formatCurrency(130)}</span></Label>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    <Card><CardHeader><CardTitle>3. Payment Method</CardTitle></CardHeader><CardContent>
                         <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                            <Label htmlFor="cod" className={`flex items-center rounded-lg border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-teal-50 shadow-md' : 'border-gray-200'}`}><RadioGroupItem value="COD" id="cod" className="mr-3 h-5 w-5" />Cash on Delivery</Label>
                            <Label htmlFor="digital" className="flex items-center rounded-lg border-2 p-4 cursor-not-allowed opacity-50 mt-4"><RadioGroupItem value="DIGITAL" id="digital" className="mr-3 h-5 w-5" disabled /><CreditCard className="mr-2 h-5 w-5" />Digital Payment (Coming Soon)</Label>
                        </RadioGroup>
                    </CardContent></Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 sticky top-24">
                    <Card className="shadow-lg">
                        <CardHeader><CardTitle>Your Order</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-start gap-4 text-sm border-b pb-4 last:border-0 last:pb-0">
                                    <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                        <Image src={item.image} alt={item.name} fill className="object-contain" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold leading-tight">{item.name}</p>
                                        <p className="text-gray-500 mt-1">{formatCurrency(item.price)}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="font-semibold w-5 text-center">{item.quantity}</span>
                                            <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 mt-2" onClick={() => removeFromCart(item.id)}>
                                            <X className="h-4 w-4 text-gray-400" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                <div className="flex justify-between"><span>Delivery</span><span>{formatCurrency(deliveryCost)}</span></div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2!"><span>Total</span><span>{formatCurrency(total)}</span></div>
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-6 mt-4 bg-primary hover:bg-teal-700 shadow-lg">
                                {isSubmitting ? 'Placing Order...' : <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Place Order Securely</span>}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
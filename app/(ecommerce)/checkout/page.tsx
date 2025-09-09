'use client';

import { useCartStore } from '@/lib/cartStore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for form inputs
  const [customerName, setCustomerName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set initial name from session
  useEffect(() => {
    if (session?.user?.name) {
      setCustomerName(session.user.name);
    }
  }, [session]);
  
  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      alert('Please provide a shipping address.');
      return;
    }
    setIsLoading(true);
    
    const customerInfo = { customerName, shippingAddress, customerPhone };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerInfo }), // Send customer info to backend
      });

      if (response.ok) {
        const order = await response.json();
        alert('Order placed successfully!');
        clearCart();
        router.push(`/order-confirmation/${order.id}`); 
      } else {
        alert('Failed to place order.');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="text-center p-12">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-center mb-10">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Details Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="w-full p-2.5 border rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
              <textarea value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} required rows={3} className="w-full p-2.5 border rounded-lg text-gray-900"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
              <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" />
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h2 className="text-2xl font-semibold mb-4">Your Order</h2>
          <ul className="divide-y">
             {items.map(item => <li key={item.id} className="py-2 flex justify-between"><span>{item.name} x {item.quantity}</span> <span>${(item.price * item.quantity).toFixed(2)}</span></li>)}
          </ul>
          <div className="border-t pt-3 mt-3 flex justify-between text-xl font-bold">
            <p>Total</p>
            <p>${total.toFixed(2)}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={isLoading || items.length === 0}
            className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
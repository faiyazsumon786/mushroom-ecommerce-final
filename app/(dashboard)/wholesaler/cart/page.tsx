// src/app/(dashboard)/wholesaler/cart/page.tsx
'use client';

import { useWholesaleCartStore } from '@/lib/wholesaleCartStore';
import Image from 'next/image';
import Link from 'next/link';

export default function WholesaleCartPage() {
  const { items, removeFromCart, updateQuantity } = useWholesaleCartStore();

  // Calculate total based on wholesale price
  const total = items.reduce((acc, item) => acc + item.wholesalePrice * item.quantity, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">My Wholesale Order</h1>

      {items.length === 0 ? (
        <div className="text-center py-10 bg-white p-6 rounded-xl shadow-lg border">
          <p className="text-xl text-gray-500">Your order cart is empty.</p>
          <Link href="/wholesaler/products" className="mt-4 inline-block bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border">
            <ul className="divide-y divide-gray-200">
              {items.map(item => (
                <li key={item.id} className="flex items-center py-4">
                  <Image src={item.image} alt={item.name} width={80} height={80} className="rounded-md mr-4 object-cover" />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-600">${item.wholesalePrice.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-16 p-2 border rounded-lg text-center text-gray-900"
                    />
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 font-semibold">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-xl shadow-lg border self-start">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="border-t pt-3 mt-3 flex justify-between text-xl font-bold">
                <p>Total</p>
                <p>${total.toFixed(2)}</p>
              </div>
            </div>
            <Link href="/wholesaler/checkout" className="mt-6 w-full block text-center bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
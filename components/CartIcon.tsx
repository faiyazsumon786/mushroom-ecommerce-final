'use client';

import { useCartStore } from '@/lib/cartStore';
import Link from 'next/link';
import { FaShoppingCart } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function CartIcon() {
  const [isMounted, setIsMounted] = useState(false);
  const { items } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const itemCount = isMounted ? items.length : 0;

  return (
    <Link href="/cart" className="relative p-2" id="cart-icon-element"> {/* <-- ID যোগ করা হয়েছে */}
      <FaShoppingCart className="text-2xl text-gray-800 hover:text-blue-600 transition-colors" />
      {itemCount > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
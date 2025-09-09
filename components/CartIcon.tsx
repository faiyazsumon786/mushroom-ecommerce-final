// src/components/CartIcon.tsx
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

  const itemCount = items.length;

  return (
    <Link href="/cart" className="relative p-2">
      <FaShoppingCart className="text-2xl text-gray-800 hover:text-blue-600 transition-colors" />
      {/* This badge will only render on the client, after the component has mounted */}
      {isMounted && itemCount > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
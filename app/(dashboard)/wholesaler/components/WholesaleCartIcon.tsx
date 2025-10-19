// src/app/(dashboard)/wholesaler/components/WholesaleCartIcon.tsx
'use client';

import { useWholesaleCartStore } from '@/lib/wholesaleCartStore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function WholesaleCartIcon() {
  const [isMounted, setIsMounted] = useState(false);
  const { items } = useWholesaleCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const itemCount = items.length;

  return (
    <li className="mb-3">
      <Link
        href="/wholesaler/cart"
        className="flex items-center justify-between p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
      >
        <span>My Order</span>
        {/* This badge will only render on the client, after the component has mounted */}
        {isMounted && itemCount > 0 && (
          <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-600 rounded-full">
            {itemCount}
          </span>
        )}
      </Link>
    </li>
  );
}
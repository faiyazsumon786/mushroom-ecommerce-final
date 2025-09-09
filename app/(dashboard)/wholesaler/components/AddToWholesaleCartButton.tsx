// src/app/(dashboard)/wholesaler/components/AddToWholesaleCartButton.tsx
'use client';

import { Product } from '@prisma/client';
import { useWholesaleCartStore } from '@/lib/wholesaleCartStore';

export default function AddToWholesaleCartButton({ product }: { product: Product }) {
  const { addToCart } = useWholesaleCartStore();

  const handleAddToCart = () => {
    addToCart(product);
    alert(`'${product.name}' added to your wholesale order!`);
  };

  return (
    <button
      onClick={handleAddToCart}
      className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
    >
      Add to Order
    </button>
  );
}
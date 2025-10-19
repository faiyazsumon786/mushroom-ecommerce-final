// src/components/AddToCartButton.tsx
'use client';

import { Product } from '@prisma/client';
import { useCartStore } from '@/lib/cartStore';
import toast from 'react-hot-toast'; // 1. Import toast

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    addToCart(product);
    // 2. Replace alert() with toast.success()
    toast.success(`'${product.name}' added to your cart!`);
  };

  return (
    <button
      onClick={handleAddToCart}
      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
    >
      Add to Cart
    </button>
  );
}
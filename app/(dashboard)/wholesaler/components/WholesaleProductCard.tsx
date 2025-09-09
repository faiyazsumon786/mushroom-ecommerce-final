// src/app/(dashboard)/wholesaler/components/WholesaleProductCard.tsx
import Image from 'next/image';
import { Product } from '@prisma/client';
import AddToWholesaleCartButton from './AddToWholesaleCartButton'; // Import the new button

export default function WholesaleProductCard({ product }: { product: Product }) {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm transition-shadow duration-300">
      <div className="relative w-full h-56">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 bg-white">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm">Current Stock: {product.stock}</p>
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400">Wholesale Price</p>
            <p className="text-xl font-bold text-green-600">${product.wholesalePrice.toFixed(2)}</p>
          </div>
          {/* Replace the old button with the new component */}
          <AddToWholesaleCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
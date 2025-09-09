// src/components/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@prisma/client';
import { formatCurrency } from '@/lib/formatCurrency'; // <-- নতুন ফাংশনটি ইম্পোর্ট করুন

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="relative w-full h-64">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{product.name}</h3>
          <div className="flex justify-between items-center mt-3">
            {/* এখানে toFixed(2) এর পরিবর্তে formatCurrency ব্যবহার করা হয়েছে */}
            <p className="text-xl font-bold text-gray-900">{formatCurrency(product.price)}</p>
            <span className="text-sm font-medium text-blue-600">View Details</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@prisma/client';
import { formatCurrency } from '@/lib/formatCurrency';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { Badge } from './ui/badge';
import { useCartStore } from '@/lib/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCartStore();

  // "Add to Cart" বাটনে ক্লিক করলে এই ফাংশনটি কাজ করবে
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // লিঙ্ক ভিজিট করা থেকে বিরত রাখা হচ্ছে
    e.stopPropagation(); // কার্ডের মূল লিঙ্কে ক্লিক হওয়া থেকে বিরত রাখা হচ্ছে
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    // কার্ডের জন্য অ্যানিমেশন এবং হোভার ইফেক্ট
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm group h-full"
    >
      <Link href={`/products/${product.id}`} className="block h-full">
        {/* Flexbox ব্যবহার করে কন্টেন্টগুলোকে সাজানো হয়েছে */}
        <div className="flex flex-col h-full">
          
          {/* ছবির অংশ */}
          <div className="relative w-full h-56 bg-gray-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
            {/* প্রোডাক্টের Type দেখানোর জন্য ব্যাজ */}
            <Badge variant="secondary" className="absolute top-3 right-3 capitalize">
              {product.type.toLowerCase()}
            </Badge>
          </div>
          
          {/* কন্টেন্টের অংশ */}
          <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-lg font-semibold text-dark truncate">{product.name}</h3>
            
            {/* বর্ণনাটি সর্বোচ্চ দুই লাইনে সীমাবদ্ধ থাকবে */}
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 h-10">{product.shortDescription}</p>
            
            {/* Price এবং Button অংশটি সবসময় নিচে থাকবে */}
            <div className="flex justify-between items-center mt-auto pt-4">
              <p className="text-xl font-bold text-primary">{formatCurrency(product.price)}</p>
              <Button size="icon" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}
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

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // অ্যানিমেশন ট্রিগার করার জন্য কাস্টম ইভেন্ট পাঠানো হচ্ছে
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const event = new CustomEvent('addToCartAnimation', {
      detail: {
        src: product.image,
        startX: buttonRect.left + buttonRect.width / 2,
        startY: buttonRect.top + buttonRect.height / 2,
      },
    });
    window.dispatchEvent(event);

    // pół সেকেন্ড দেরি করে কার্টে যোগ করা হচ্ছে
    setTimeout(() => {
      addToCart(product);
      toast.success(`${product.name} added to cart!`);
    }, 500);
  };

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm group h-full"
    >
      <Link href={`/products/${product.id}`} className="block h-full">
        <div className="flex flex-col h-full">
          <div className="relative w-full h-56 bg-gray-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
            <Badge variant="secondary" className="absolute top-3 right-3 capitalize">
              {product.type.toLowerCase()}
            </Badge>
          </div>
          <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-lg font-semibold text-dark truncate">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 h-10">{product.shortDescription}</p>
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
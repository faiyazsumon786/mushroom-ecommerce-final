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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm group h-full flex flex-col"
    >
      <Link href={`/products/${product.id}`} className="block flex flex-col flex-grow">
        <div className="relative w-full h-56 bg-gray-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            // FIX: Changed from object-cover to object-contain
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-3 right-3">{product.type}</Badge>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-dark truncate h-7">{product.name}</h3>
          <p className="text-sm text-gray-500 mt-1 flex-grow h-10">{product.shortDescription}</p>
          <div className="flex justify-between items-center mt-4">
            <p className="text-xl font-bold text-primary">{formatCurrency(product.price)}</p>
            <Button size="icon" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
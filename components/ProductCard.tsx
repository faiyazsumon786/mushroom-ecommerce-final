'use client';
import { Product } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/formatCurrency';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { Badge } from './ui/badge';
import { useCartStore } from '@/lib/cartStore';
import { useQuickViewStore } from '@/lib/quickViewStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCartStore();
  const { onOpen: onQuickViewOpen } = useQuickViewStore();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const event = new CustomEvent('addToCartAnimation', {
      detail: {
        src: product.image,
        startX: buttonRect.left + buttonRect.width / 2,
        startY: buttonRect.top + buttonRect.height / 2,
      },
    });
    window.dispatchEvent(event);

    setTimeout(() => {
      addToCart(product);
      toast.success(`${product.name} added to cart!`);
    }, 500);
  };

  const handleQuickView = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickViewOpen(product);
  };

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-card border border-gray-100 rounded-2xl overflow-hidden shadow-sm group h-full"
    >
      <div className="relative h-full">
        <Link href={`/products/${product.id}`} className="block h-full">
          <div className="flex flex-col h-full">
            <div className="relative w-full h-56 bg-white">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
              <Badge variant="secondary" className="absolute top-4 left-4 capitalize bg-white/80 backdrop-blur-sm">
                {product.type.toLowerCase()}
              </Badge>
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-dark truncate">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 h-10">{product.shortDescription}</p>
              
              <div className="flex justify-between items-center mt-auto pt-4">
                <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
                <Button size="icon" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleAddToCart}>
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Quick View বাটন (হোভার করলে দেখা যাবে) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button onClick={handleQuickView} className="flex items-center gap-2 shadow-lg">
                <Eye className="h-4 w-4" />
                Quick View
            </Button>
        </div>
      </div>
    </motion.div>
  );
}
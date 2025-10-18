'use client';

import { Category } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
      {categories.map(category => (
        <Link key={category.id} href={`/products?category=${category.id}`} className="block group text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-32 h-32 lg:w-40 lg:h-40 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-white transition-all duration-300 group-hover:shadow-xl group-hover:border-primary"
          >
            <Image 
              src={category.imageUrl || '/placeholder.jpg'} 
              alt={category.name}
              fill
              sizes="160px"
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </motion.div>
          <h3 className="mt-4 font-semibold text-lg text-dark group-hover:text-primary transition-colors">
            {category.name}
          </h3>
        </Link>
      ))}
    </div>
  );
}
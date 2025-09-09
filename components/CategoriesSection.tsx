// src/components/CategoriesSection.tsx
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';

const prisma = new PrismaClient();

async function getCategories() {
  return prisma.category.findMany();
}

export default async function CategoriesSection() {
  const categories = await getCategories();

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map(category => (
            <Link key={category.id} href={`/products?category=${category.id}`} className="block group text-center">
              <div className="relative w-full h-32 sm:h-40 rounded-full overflow-hidden mx-auto border-4 border-white shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                <Image 
                  src={category.imageUrl || '/placeholder.jpg'} 
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
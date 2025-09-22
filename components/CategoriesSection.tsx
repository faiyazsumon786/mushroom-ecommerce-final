import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from './ui/card';

async function getCategories() {
  return prisma.category.findMany({ 
    where: { parentId: null },
    take: 4
  });
}

export default async function CategoriesSection() {
  const categories = await getCategories();

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center">
            <h2 className="font-serif text-4xl font-bold text-brand-dark">Explore Our Collections</h2>
            <p className="mt-2 text-gray-600">Discover products by their category.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map(category => (
            <Link key={category.id} href={`/products?category=${category.id}`} className="block group">
              <div className="relative overflow-hidden rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <div className="relative w-full h-72">
                  <Image 
                    src={category.imageUrl || '/placeholder.jpg'} 
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-white font-serif text-2xl font-bold">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
// src/components/ProductRow.tsx
import { Product } from '@prisma/client';
import ProductCard from './ProductCard';

interface ProductRowProps {
  title: string;
  products: Product[];
}

export default function ProductRow({ title, products }: ProductRowProps) {
  return (
    <section className="container mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
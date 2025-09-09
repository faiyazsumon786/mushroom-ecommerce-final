'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from '@prisma/client';
import ProductCard from '@/components/ProductCard';
import { useSearchParams } from 'next/navigation';

export default function ProductPageClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    };
    fetchCategories();
    
    const categoryFromUrl = searchParams.get('category');
    if(categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }

  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const params = new URLSearchParams({
        query: searchTerm,
        categoryId: selectedCategory,
        sortBy: sortBy,
      });
      const res = await fetch(`/api/search-products?${params.toString()}`);
      const data = await res.json();
      setProducts(data);
      setIsLoading(false);
    };
    fetchProducts();
  }, [searchTerm, selectedCategory, sortBy]);

  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">All Products</h1>
      <p className="text-center text-gray-600 mb-10">Find the perfect mushroom for your next meal.</p>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-lg border">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 border rounded-md text-gray-900"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded-md bg-white text-gray-900"
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded-md bg-white text-gray-900"
        >
          <option value="createdAt_desc">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-20">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No products match your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
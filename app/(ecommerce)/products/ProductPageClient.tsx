'use client';
import { useState, useEffect, Suspense } from 'react';
import { Product, Category } from '@prisma/client';
import ProductCard from '@/components/ProductCard';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// এই নতুন কম্পোনেন্টটি searchParams হ্যান্ডেল করার জন্য তৈরি করা হয়েছে
function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      
      // searchParams এখন সবসময় আপ-টু-ডেট থাকবে
      const params = new URLSearchParams(searchParams.toString());

      const res = await fetch(`/api/search-products?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        setProducts(await res.json());
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, [searchParams]); // শুধুমাত্র searchParams পরিবর্তন হলেই এটি আবার চলবে

  if (isLoading) {
    return <div className="text-center py-20">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center py-20 text-gray-500">No products found matching your criteria.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product as any} />
      ))}
    </div>
  );
}

// এটি আপনার মূল পেজ কম্পোনেন্ট
export default function ProductPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt_desc');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // শুধুমাত্র ক্যাটাগরিগুলো একবার fetch করা হচ্ছে
    const fetchCategories = async () => {
        const res = await fetch('/api/categories', { cache: 'no-store' });
        if (res.ok) setCategories(await res.json());
    };
    fetchCategories();
  }, []);

  // যখন ব্যবহারকারী কোনো ফিল্টার পরিবর্তন করবে, তখন URL আপডেট হবে
  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('query', searchTerm);
    if (sortBy) params.set('sortBy', sortBy);
    if (selectedCategory) params.set('category', selectedCategory);
    
    // router.push ব্যবহার করে URL পরিবর্তন করা হচ্ছে, যা ProductGrid-কে re-render করাবে
    router.push(`/products?${params.toString()}`);
  };

  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Our Products</h1>
      <p className="text-center text-gray-600 mb-10">Find the perfect mushroom for your next meal.</p>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-lg border">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
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
        <Button onClick={handleFilterChange}>Filter</Button>
      </div>
      
      {/* ProductGrid কম্পোনেন্টটি Suspense-এর ভেতরে থাকবে */}
      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <ProductGrid />
      </Suspense>
    </main>
  );
}
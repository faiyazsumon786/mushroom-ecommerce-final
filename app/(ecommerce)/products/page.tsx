"use client";

import { useState, useEffect } from "react";
import { Product, Category } from "@prisma/client";
import ProductCard from "@/components/ProductCard";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ProductPageClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt_desc");
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Read current category from the URL
  const categoryFromUrl = searchParams.get("category") || "";

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Fetch products when search, sort, or category changes
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const params = new URLSearchParams({
        query: searchTerm,
        categoryId: categoryFromUrl,
        sortBy,
      });
      const res = await fetch(`/api/search-products?${params.toString()}`);
      const data = await res.json();
      setProducts(data);
      setIsLoading(false);
    };
    fetchProducts();
  }, [searchTerm, sortBy, categoryFromUrl]);

  // Handle category change — update the URL
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory) {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">All Products</h1>
      <p className="text-center text-gray-600 mb-10">
        Find the perfect mushroom for your next meal.
      </p>

      {/* Filter and Search UI */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-lg border">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 border rounded-md text-gray-900"
        />
        <select
          value={categoryFromUrl}
          onChange={handleCategoryChange}
          className="p-2 border rounded-md bg-white text-gray-900"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
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

      {/* Product Grid */}
      {isLoading ? (
        <div className="text-center py-20">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No products match your criteria.
        </div>
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

export default function ProductsPage() {
  return (
    <Suspense
      fallback={<div className="text-center p-20">Loading Filters...</div>}
    >
      <ProductPageClient />
    </Suspense>
  );
}

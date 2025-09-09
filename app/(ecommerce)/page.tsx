import { PrismaClient } from '@prisma/client';
import HeroSlider from '@/components/HeroSlider';
import ProductRow from '@/components/ProductRow';
import CategoriesSection from '@/components/CategoriesSection';
import Link from 'next/link';

const prisma = new PrismaClient();

// ডাটাবেস থেকে ব্যানারগুলো আনার ফাংশন
async function getBanners() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return banners;
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return [];
  }
}

// ডাটাবেস থেকে নতুন প্রোডাক্টগুলো আনার ফাংশন
async function getNewArrivals() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'LIVE' },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    return products;
  } catch (error) {
    console.error("Failed to fetch new arrivals:", error);
    return [];
  }
}

// টপ-সেলিং প্রোডাক্ট আনার ফাংশন
async function getTopSelling() {
  try {
    // দ্রষ্টব্য: এটি একটি সিম্পল লজিক। বাস্তবে, এটি বিক্রির ডেটার উপর ভিত্তি করে হবে।
    const products = await prisma.product.findMany({
      where: { status: 'LIVE' },
      orderBy: { stock: 'asc' }, // যেগুলোর স্টক কম, সেগুলো বেশি বিক্রি হয়েছে ধরে নিচ্ছি
      take: 4,
    });
    return products;
  } catch (error) {
    console.error("Failed to fetch top selling products:", error);
    return [];
  }
}

export default async function HomePage() {
  const [banners, newArrivals, topSelling] = await Promise.all([
    getBanners(),
    getNewArrivals(),
    getTopSelling(),
  ]);

  return (
    <div className="space-y-12">
      {/* Hero Slider */}
      <HeroSlider banners={banners} />

      {/* Categories Section */}
      <CategoriesSection />

      {/* Top Selling Products */}
      {topSelling.length > 0 && (
        <ProductRow title="Top Selling Products" products={topSelling} />
      )}

      {/* Discount Banner */}
      <section className="bg-blue-600 my-12">
        <div className="container mx-auto px-6 py-10 text-center text-white">
          <h2 className="text-3xl font-bold">Special Discount!</h2>
          <p className="mt-2">Get up to 30% off on selected mushroom varieties this week.</p>
          <Link
            href="/products"
            className="mt-6 inline-block bg-white text-blue-600 py-2 px-6 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse Offers
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <ProductRow title="New Arrivals" products={newArrivals} />
      )}
    </div>
  );
}
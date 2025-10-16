import prisma from '@/lib/prisma';
import HeroSlider from '@/components/HeroSlider';
import ProductCarousel from '@/components/ProductCarousel';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import AnimatedSection from '@/components/AnimatedSection';
import { Quote, Leaf, Truck, ShieldCheck } from 'lucide-react';
import CategoriesSection from '@/components/CategoriesSection';

// This function fetches all data needed for the homepage at once
async function getDataForHomepage() {
  const [banners, newArrivals, topSelling, featuredProduct, recentPosts] = await Promise.all([
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.product.findMany({ where: { status: 'LIVE' }, orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.product.findMany({ where: { status: 'LIVE' }, orderBy: { stock: 'asc' }, take: 8 }),
    prisma.product.findFirst({ where: { status: 'LIVE' } }),
    prisma.post.findMany({ where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' }, take: 3 }),
  ]);
  return { banners, newArrivals, topSelling, featuredProduct, recentPosts };
}

export default async function HomePage() {
  const { banners, newArrivals, topSelling, featuredProduct, recentPosts } = await getDataForHomepage();

  return (
    <div className="bg-background">
      <HeroSlider banners={banners} />
      
      <AnimatedSection><CategoriesSection /></AnimatedSection>

      {featuredProduct && (
        <AnimatedSection>
            <section className="bg-teal-50 py-20">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-xl bg-white">
                        <Image 
                            src={featuredProduct.image} 
                            alt={featuredProduct.name} 
                            fill 
                            className="object-contain p-4"
                        />
                    </div>
                    <div>
                        <h3 className="text-sm uppercase text-primary font-semibold tracking-wider">Product Spotlight</h3>
                        <h2 className="font-serif text-5xl font-bold text-dark mt-2">{featuredProduct.name}</h2>
                        <p className="mt-4 text-gray-600 text-lg">{featuredProduct.shortDescription}</p>
                        <Link href={`/products/${featuredProduct.id}`}>
                            <Button size="lg" className="mt-8 bg-primary hover:bg-teal-700 text-lg py-6 px-8 rounded-full">
                                View Details
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </AnimatedSection>
      )}

      {topSelling.length > 0 && (
        <AnimatedSection>
          <ProductCarousel title="Top Selling Products" products={topSelling} autoplay={true}/>
        </AnimatedSection>
      )}
      
      {/* Testimonials Section */}
      <AnimatedSection>
        <section className="bg-white py-20">
            <div className="container mx-auto px-6 text-center">
                <h2 className="font-serif text-4xl font-bold text-dark mb-12">What Our Customers Say</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
                        <Quote className="text-primary h-8 w-8 mb-4 mx-auto" />
                        <p className="text-gray-600 italic">"The best mushrooms I've ever tasted! So fresh and flavorful."</p>
                        <p className="mt-4 font-semibold text-dark">- Anika Tabassum</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
                        <Quote className="text-primary h-8 w-8 mb-4 mx-auto" />
                        <p className="text-gray-600 italic">"Amazing quality and fast delivery. Zamzam Mushroom is my go-to."</p>
                        <p className="mt-4 font-semibold text-dark">- Rashed Kabir</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
                        <Quote className="text-primary h-8 w-8 mb-4 mx-auto" />
                        <p className="text-gray-600 italic">"I love the variety they offer. The quality is always top-notch!"</p>
                        <p className="mt-4 font-semibold text-dark">- Fatima Akter</p>
                    </div>
                </div>
            </div>
        </section>
      </AnimatedSection>

      {newArrivals.length > 0 && (
        <AnimatedSection>
          <ProductCarousel title="New Arrivals" products={newArrivals} />
        </AnimatedSection>
      )}
      
      {/* Featured Blog Posts Section */}
      {recentPosts.length > 0 && (
          <AnimatedSection>
            <section className="py-20 bg-teal-50">
                <div className="container mx-auto px-6">
                    <h2 className="font-serif text-4xl font-bold text-dark text-center mb-12">From Our Blog</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {recentPosts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </section>
          </AnimatedSection>
      )}

      {/* Newsletter Signup Section */}
      <AnimatedSection>
        <section className="bg-dark py-20 text-gray-700">
            <div className="container mx-auto px-6 text-center">
                <h2 className="font-serif text-4xl font-bold">Join Our Newsletter</h2>
                <p className="mt-4 text-gray-300 max-w-2xl mx-auto">Get the latest updates on new products, special offers, and delicious mushroom recipes.</p>
                <form className="mt-8 max-w-md mx-auto flex gap-2">
                    <Input type="email" placeholder="Enter your email address" className="bg-white/90 text-dark"/>
                    <Button type="submit" className="bg-primary hover:bg-teal-600">Subscribe</Button>
                </form>
            </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
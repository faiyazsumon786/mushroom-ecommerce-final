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

// এই ফাংশনটি হোমপেজের জন্য প্রয়োজনীয় সব ডেটা একসাথে নিয়ে আসবে
async function getDataForHomepage() {
  const [banners, newArrivals, topSelling, featuredProduct, recentPosts] = await Promise.all([
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.product.findMany({ where: { status: 'LIVE' }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.product.findMany({ where: { status: 'LIVE' }, orderBy: { stock: 'asc' }, take: 10 }),
    prisma.product.findFirst({ where: { status: 'LIVE' }, include: { images: true, category: true } }),
    prisma.post.findMany({ where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' }, take: 3 }),
  ]);
  return { banners, newArrivals, topSelling, featuredProduct, recentPosts };
}

export default async function HomePage() {
  const { banners, newArrivals, topSelling, featuredProduct, recentPosts } = await getDataForHomepage();

  return (
    <div className="bg-background">
      {/* Section 1: Hero Slider */}
      <HeroSlider banners={banners} />
      
      {/* Section 2: Categories */}
      <AnimatedSection><CategoriesSection /></AnimatedSection>

      {/* Section 3: "Why Choose Us" Section */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 text-center">
              <h2 className="font-serif text-4xl font-bold text-dark mb-12">Why Choose Zamzam Mushroom?</h2>
              <div className="grid md:grid-cols-3 gap-12">
                  <div className="text-center">
                      <Leaf className="h-12 w-12 mx-auto text-primary" />
                      <h3 className="text-2xl font-bold text-dark mt-4 mb-2">100% Organic</h3>
                      <p className="text-gray-600">Cultivated without any harmful chemicals, ensuring purity and taste.</p>
                  </div>
                  <div className="text-center">
                      <Truck className="h-12 w-12 mx-auto text-primary" />
                      <h3 className="text-2xl font-bold text-dark mt-4 mb-2">Farm Fresh Delivery</h3>
                      <p className="text-gray-600">Delivered directly from our farms to your doorstep for maximum freshness.</p>
                  </div>
                  <div className="text-center">
                      <ShieldCheck className="h-12 w-12 mx-auto text-primary" />
                      <h3 className="text-2xl font-bold text-dark mt-4 mb-2">Quality Assured</h3>
                      <p className="text-gray-600">Every batch is tested to meet the highest quality standards.</p>
                  </div>
              </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Section 4: Top Selling Products (Carousel) */}
      {topSelling.length > 0 && (
        <AnimatedSection>
          <ProductCarousel title="Top Selling Products" products={topSelling} autoplay={true} />
        </AnimatedSection>
      )}

      {/* Section 5: Featured Product Spotlight */}
      {featuredProduct && (
        <AnimatedSection>
            <section className="bg-teal-50 py-24">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
                        <Image 
                            src={featuredProduct.image} 
                            alt={featuredProduct.name} 
                            fill 
                            className="object-contain p-8 bg-white"
                        />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm uppercase text-primary font-semibold tracking-wider">Product Spotlight</h3>
                        <h2 className="font-serif text-5xl font-bold text-dark mt-4">{featuredProduct.name}</h2>
                        <p className="mt-6 text-gray-600 text-lg leading-relaxed">{featuredProduct.shortDescription}</p>
                        <Link href={`/products/${featuredProduct.id}`}>
                            <Button size="lg" className="mt-8 bg-primary hover:bg-teal-700 text-lg py-6 px-8 rounded-full shadow-lg">
                                View Details
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </AnimatedSection>
      )}

      {/* Section 6: New Arrivals (Carousel) */}
      {newArrivals.length > 0 && (
        <AnimatedSection>
          <ProductCarousel title="New Arrivals" products={newArrivals} />
        </AnimatedSection>
      )}
      
      {/* Section 7: Featured Blog Posts */}
      {recentPosts.length > 0 && (
          <AnimatedSection>
            <section className="py-24 bg-white">
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

      {/* Section 8: Newsletter Signup */}
      <AnimatedSection>
        <section className="bg-dark py-24">
            <div className="container mx-auto px-6 text-center">
                <h2 className="font-serif text-4xl font-bold">Join Our Newsletter</h2>
                <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Get the latest updates on new products, special offers, and delicious mushroom recipes.</p>
                <form className="mt-8 max-w-md mx-auto flex gap-2">
                    <Input type="email" placeholder="Enter your email address" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-teal-600">Subscribe</Button>
                </form>
            </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
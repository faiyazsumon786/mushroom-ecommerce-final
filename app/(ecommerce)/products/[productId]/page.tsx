import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { format } from 'date-fns';
import { authOptions } from '@/lib/auth';
import { formatCurrency } from '@/lib/formatCurrency';
import { notFound } from 'next/navigation';

import AddToCartButton from '@/components/AddToCartButton';
import ReviewForm from '@/components/ReviewForm';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductCarousel from '@/components/ProductCarousel';
import PostCard from '@/components/PostCard';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // <-- নতুন: Tabs ইম্পোর্ট করা হয়েছে

// প্রোডাক্ট এবং সম্পর্কিত সব ডেটা আনার ফাংশন
async function getProductData(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      images: true,
      category: true,
      relatedPosts: { where: { status: 'PUBLISHED' } }, // শুধুমাত্র পাবলিশড পোস্ট আনা হচ্ছে
    },
  });

  if (!product) return { product: null, relatedProducts: [] };

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: 'LIVE',
    },
    take: 4,
  });

  return { product, relatedProducts };
}

export default async function ProductDetailPage({ params }: any) {
  const { product, relatedProducts } = await getProductData(params.productId);
  const session = await getServerSession(authOptions);

  if (!product) {
    notFound();
  }

  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* --- Main Product Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <ProductImageGallery 
            primaryImage={product.image}
            galleryImages={product.images}
            altText={product.name}
          />
          <div className="space-y-6 sticky top-24">
            <Badge variant="outline">{product.category.name}</Badge>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark">{product.name}</h1>
            
            {product.shortDescription && <p className="text-gray-600 text-lg leading-relaxed">{product.shortDescription}</p>}
            
            {averageRating > 0 && (
                <div className="flex items-center">
                    <div className="flex text-yellow-400">{Array(Math.round(averageRating)).fill(0).map((_, i) => <span key={i} className="text-2xl">★</span>)}</div>
                    <p className="ml-2 text-gray-600">({product.reviews.length} reviews)</p>
                </div>
            )}
            
            <p className="font-serif text-4xl font-bold text-brand-green">{formatCurrency(product.price)}</p>
            <div className="text-sm text-gray-500">Stock: <span className="font-semibold text-green-700">{product.stock > 0 ? `${product.stock} items available` : 'Out of Stock'}</span></div>
            
            <div className="pt-4 border-t">
                <AddToCartButton product={product} />
            </div>
          </div>
        </div>

        {/* --- Tab Section for Details, Reviews, and Posts --- */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Full Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviews.length})</TabsTrigger>
              <TabsTrigger value="posts">Related Posts ({product.relatedPosts.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6 prose lg:prose-xl max-w-none">
              <p>{product.description}</p>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
              {session?.user && <ReviewForm productId={product.id} />}
              <div className="mt-8 space-y-8">
                {product.reviews.length > 0 ? (
                  product.reviews.map(review => (
                    <div key={review.id} className="border-b pb-6">
                        {/* ... রিভিউ দেখানোর কোড ... */}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {product.relatedPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* --- Related Products Section --- */}
      {relatedProducts.length > 0 && (
          <div className="bg-white">
            <ProductCarousel title="You Might Also Like" products={relatedProducts} />
          </div>
      )}
    </div>
  );
}
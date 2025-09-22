import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { format } from 'date-fns';
import { authOptions } from '@/lib/auth';
import { formatCurrency } from '@/lib/formatCurrency';
import prisma from '@/lib/prisma';
import AddToCartButton from '@/components/AddToCartButton';
import ReviewForm from '@/components/ReviewForm';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductRow from '@/components/ProductRow';
import { Badge } from '@/components/ui/badge';
import PostCard from '@/components/PostCard';

async function getProduct(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      images: true,
      category: true,
      relatedPosts: true,
    },
  });
}

async function getRelatedProducts(categoryId: string, currentProductId: string) {
    return prisma.product.findMany({
        where: {
            categoryId: categoryId,
            id: { not: currentProductId }, // বর্তমান প্রোডাক্টটি বাদ দিয়ে
            status: 'LIVE',
        },
        take: 4, // ৪টি সম্পর্কিত প্রোডাক্ট দেখানো হবে
    });
}

export default async function ProductDetailPage({ params }: any) {
  const product = await getProduct(params.productId);
  const session = await getServerSession(authOptions);

  if (!product) {
    return <div className="text-center p-12">Product not found!</div>;
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <ProductImageGallery 
            primaryImage={product.image}
            galleryImages={product.images}
            altText={product.name}
          />

          <div className="space-y-6">
            <Badge variant="outline">{product.category.name}</Badge>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-brand-dark">{product.name}</h1>
            
            {averageRating > 0 && (
                <div className="flex items-center">
                    <div className="flex text-yellow-400">
                        {Array(Math.round(averageRating)).fill(0).map((_, i) => <span key={i} className="text-2xl">★</span>)}
                    </div>
                    <p className="ml-2 text-gray-600">({product.reviews.length} reviews)</p>
                </div>
            )}
            
            <p className="font-serif text-4xl font-bold text-brand-green">{formatCurrency(product.price)}</p>
            <p className="text-gray-600 text-lg leading-relaxed">{product.shortDescription}</p>
            <div className="text-sm text-gray-500">Stock: <span className="font-semibold text-green-700">{product.stock} items available</span></div>
            
            <div className="pt-4 border-t">
                <AddToCartButton product={product} />
            </div>

            <div className="prose mt-6">
                <h3 className="font-semibold">Description</h3>
                <p>{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 border-t">
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
        {session?.user && <ReviewForm productId={product.id} />}
        <div className="mt-8 space-y-8">
            {/* ... রিভিউ সেকশনের কোড ... */}
        </div>
      </div>
      
      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
          <div className="bg-white">
            <ProductRow title="Related Products" products={relatedProducts} />
          </div>
      )}

       {product.relatedPosts.length > 0 && (
          <div className="container mx-auto px-4 py-12 border-t">
            <h2 className="text-3xl font-bold mb-8 text-center">Related From Our Blog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {product.relatedPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
          </div>
      )}
    </div>
  );
}
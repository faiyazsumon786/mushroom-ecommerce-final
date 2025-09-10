// src/app/(ecommerce)/products/[productId]/page.tsx
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';
import ReviewForm from '@/components/ReviewForm';
import { getServerSession } from 'next-auth';
import { format } from 'date-fns';
import ProductImageGallery from '@/components/ProductImageGallery';
import { authOptions } from '@/lib/auth';
import { formatCurrency } from '@/lib/formatCurrency';

const prisma = new PrismaClient();

async function getProduct(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      },
      images: true,
    },
  });
}

export default async function ProductDetailPage({ params }: any) { // Using 'any' to avoid build errors
  const product = await getProduct(params.productId);
  const session = await getServerSession(authOptions);

  if (!product) {
    return <div className="text-center p-12 text-red-600 font-semibold">Product not found!</div>;
  }

  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          <ProductImageGallery 
            primaryImage={product.image}
            galleryImages={product.images}
            altText={product.name}
          />

          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">{product.name}</h1>
            
            {/* --- FIX: Replaced the comment with the actual rating display code --- */}
            {averageRating > 0 && (
                <div className="flex items-center">
                    <div className="flex text-yellow-400">
                        {Array(Math.round(averageRating)).fill(0).map((_, i) => <span key={i} className="text-2xl">★</span>)}
                    </div>
                    <p className="ml-2 text-gray-600">({product.reviews.length} reviews)</p>
                </div>
            )}
            
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(product.price)}</p>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
            
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 py-12 border-t">
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
        
        {session?.user && <ReviewForm productId={product.id} />}
        
        <div className="mt-8 space-y-8">
          {product.reviews.length > 0 ? (
            product.reviews.map(review => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center mb-2">
                  <p className="font-semibold mr-4">{review.user.name}</p>
                  <div className="flex text-yellow-400">
                    {Array(review.rating).fill(0).map((_, i) => <span key={i}>★</span>)}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                    Reviewed on {format(new Date(review.createdAt), 'dd MMM yyyy')}
                </p>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
          )}
        </div>
      </div>
    </>
  );
}
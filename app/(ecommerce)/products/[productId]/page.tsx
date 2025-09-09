import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';
import ReviewForm from '@/components/ReviewForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import { format } from 'date-fns';

const prisma = new PrismaClient();

async function getProduct(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: {
        include: {
          user: true, // রিভিউ দেওয়া ইউজারের নাম দেখানোর জন্য
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

// FIX: Correctly typed props
interface ProductDetailPageProps {
  params: { productId: string };
}

export default async function ProductDetailPage({ params }: any) {
  const product = await getProduct(params.productId);
  const session = await getServerSession();

  if (!product) {
    return <div className="text-center p-12 text-red-600 font-semibold">Product not found!</div>;
  }

  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <>
      {/* ============================================= */}
      {/* প্রোডাক্টের বিস্তারিত তথ্য সেকশন         */}
      {/* ============================================= */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Left Side: Product Image */}
          <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg border">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Right Side: Product Info */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">{product.name}</h1>
            
            {/* Average Rating Display */}
            {averageRating > 0 && (
                <div className="flex items-center">
                    <div className="flex text-yellow-400">
                        {Array(Math.round(averageRating)).fill(0).map((_, i) => <span key={i} className="text-2xl">★</span>)}
                    </div>
                    <span className="ml-2 text-gray-600">({product.reviews.length} reviews)</span>
                </div>
            )}
            
            <p className="text-3xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
            
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* কাস্টমার রিভিউ সেকশন                 */}
      {/* ============================================= */}
      <div className="container mx-auto px-4 py-12 border-t">
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
        
        {/* রিভিউ দেওয়ার ফর্ম, শুধুমাত্র লগইন করা ইউজাররা দেখতে পাবে */}
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
'use client';

import { useQuickViewStore } from '@/lib/quickViewStore';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ProductImageGallery from './ProductImageGallery';
import AddToCartButton from './AddToCartButton';
import { formatCurrency } from '@/lib/formatCurrency';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCartStore } from '@/lib/cartStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Product, ProductImage, Category } from '@prisma/client';

type ProductWithDetails = Product & {
  images: ProductImage[];
  category: Category;
};

export default function QuickViewModal() {
  const { isOpen, product, onClose } = useQuickViewStore();
  const { addToCart } = useCartStore();
  const router = useRouter();

  if (!product) return null;
  const detailedProduct = product as ProductWithDetails;

  const handleBuyNow = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
    onClose();
    router.push('/checkout');
  };

  // ✅ গ্যালারি ইমেজ গুলো ঠিকভাবে নিচ্ছি
  const galleryImages = Array.isArray(detailedProduct.images)
  ? detailedProduct.images
  : [];

  // ✅ ফিচার ইমেজ ঠিক করা হচ্ছে
  const primaryImage =
    detailedProduct.image ||
    (galleryImages.length > 0 ? galleryImages[0].url : '/placeholder.png');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          max-w-7xl
          w-[95vw]
          p-0
          border-none
          rounded-3xl
          overflow-hidden
          shadow-2xl
          bg-gradient-to-br from-white via-gray-50 to-gray-100
          backdrop-blur-lg
        "
      >
        <DialogTitle className="sr-only">{detailedProduct.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Quick view of {detailedProduct.name}
        </DialogDescription>

        {/* 🧭 Clean Two-Column Layout */}
        <div className="flex flex-col md:flex-row min-h-[580px]">

          {/* 🖼️ Left: Product Image */}
          <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <ProductImageGallery
                primaryImage={primaryImage}
                galleryImages={galleryImages}
                altText={detailedProduct.name}
              />
            </div>
          </div>

          {/* 📝 Right: Info Section */}
          <div className="flex-1 bg-white p-10 flex flex-col justify-center">
            {detailedProduct.category && (
              <Badge
                variant="outline"
                className="mb-5 text-base px-5 py-2 rounded-full border-2 border-gray-200 bg-gray-50 text-gray-700"
              >
                {detailedProduct.category.name}
              </Badge>
            )}

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 leading-tight tracking-tight">
              {detailedProduct.name}
            </h2>

            <div className="mb-5">
              <span className="text-sm text-gray-500">Stock: </span>
              <span
                className={`font-semibold ${
                  detailedProduct.stock > 0 ? 'text-green-700' : 'text-red-600'
                }`}
              >
                {detailedProduct.stock > 0
                  ? `${detailedProduct.stock} items available`
                  : 'Out of Stock'}
              </span>
            </div>

            <p className="text-4xl font-bold text-indigo-700 mb-6">
              {formatCurrency(detailedProduct.price)}
            </p>

            <p className="text-gray-600 leading-relaxed mb-8 line-clamp-4">
              {detailedProduct.description}
            </p>

            {/* 🛒 Buttons — stacked layout */}
            <div className="flex flex-col gap-4 mt-auto">
              <Button
                onClick={handleBuyNow}
                size="lg"
                className="
                  w-full
                  bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
                  text-white font-semibold text-lg py-6 rounded-2xl
                  shadow-md hover:shadow-lg
                  transition-all duration-300 hover:scale-[1.03]
                "
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-bounce">🛍️</span> Buy Now
                </span>
              </Button>

              <div className="w-full flex justify-center">
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

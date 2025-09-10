// src/components/ProductImageGallery.tsx
'use client';

import { Product, ProductImage } from '@prisma/client';
import Image from 'next/image';
import { useState } from 'react';

interface ProductImageGalleryProps {
  primaryImage: string;
  galleryImages: ProductImage[];
  altText: string;
}

export default function ProductImageGallery({ primaryImage, galleryImages, altText }: ProductImageGalleryProps) {
  // গ্যালারির সব ছবি (প্রাইমারি + অন্যান্য) একটি অ্যারেতে রাখা হচ্ছে
  const allImages = [
    { id: 'primary', url: primaryImage },
    ...galleryImages
  ];

  // কোন ছবিটি বর্তমানে বড় করে দেখানো হবে, তা ঠিক করার জন্য
  const [activeImage, setActiveImage] = useState(allImages[0].url);

  return (
    <div className="flex flex-col gap-4">
      {/* বড় ছবিটি দেখানোর জায়গা */}
      <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg border">
        <Image
          src={activeImage}
          alt={altText}
          fill
          className="object-cover transition-opacity duration-300"
          key={activeImage} // key পরিবর্তন হলে Image রিলোড হবে
        />
      </div>

      {/* ছোট থাম্বনেইল ছবিগুলোর সারি */}
      <div className="grid grid-cols-5 gap-3">
        {allImages.map((image) => (
          <div
            key={image.id}
            onClick={() => setActiveImage(image.url)}
            className={`relative w-full h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
              activeImage === image.url ? 'border-blue-600 scale-105' : 'border-transparent hover:border-gray-400'
            }`}
          >
            <Image
              src={image.url}
              alt={`Thumbnail of ${altText}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
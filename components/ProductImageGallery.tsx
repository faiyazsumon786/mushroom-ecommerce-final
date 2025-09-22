'use client';
import { Product, ProductImage } from '@prisma/client';
import Image from 'next/image';
import { useState } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css'; // Import the required styles

interface ProductImageGalleryProps {
  primaryImage: string;
  galleryImages: ProductImage[];
  altText: string;
}

export default function ProductImageGallery({ primaryImage, galleryImages, altText }: ProductImageGalleryProps) {
  const allImages = [{ id: 'primary', url: primaryImage }, ...galleryImages];
  const [activeImage, setActiveImage] = useState(allImages[0].url);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Viewer with Click-to-Zoom */}
      <div className="rounded-xl overflow-hidden shadow-lg border bg-white flex items-center justify-center">
        <Zoom>
          <Image
            src={activeImage}
            alt={altText}
            width={500}
            height={500}
            className="object-contain h-96 w-full p-4 cursor-zoom-in"
            key={activeImage}
          />
        </Zoom>
      </div>
      
      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-3">
        {allImages.map((image) => (
          <div
            key={image.id}
            onClick={() => setActiveImage(image.url)}
            className={`relative w-full h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all bg-white flex items-center justify-center ${
              activeImage === image.url ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Image
              src={image.url}
              alt={`Thumbnail of ${altText}`}
              fill
              sizes="64px"
              className="object-contain p-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
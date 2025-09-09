// src/components/HeroSlider.tsx
'use client'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import { Banner } from '@prisma/client' // Import the Banner type

// The component now accepts banners as a prop
export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()])

  if (banners.length === 0) {
    return null; // Don't show slider if no banners are available
  }

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {banners.map((banner) => (
          <div className="relative flex-shrink-0 flex-grow-0 w-full h-96" key={banner.id}>
            <Image
              src={banner.imageUrl}
              alt={banner.title || 'Homepage banner'}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
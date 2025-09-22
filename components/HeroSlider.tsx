'use client'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HeroSlider({ banners }: { banners: any[] }) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })])

  if (!banners || banners.length === 0) return null;

  return (
    <div className="overflow-hidden relative" ref={emblaRef}>
      <div className="flex">
        {banners.map((banner) => (
          <div className="relative flex-[0_0_100%] h-[80vh]" key={banner.id}>
            <Image
              src={banner.imageUrl}
              alt={banner.title || 'Homepage banner'}
              fill
              className="object-cover" // This works best with wide images
              priority
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white max-w-2xl p-4">
                <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  {/* {banner.title || "Fresh Organic Mushrooms"} */}
                </h1>
                {/* <p className="text-lg mb-8 drop-shadow-md">Delivered straight from the farm to your table.</p> */}
                <Link href={banner.link || '/products'}>
                  <Button size="lg" className="bg-brand-yellow text-brand-dark hover:bg-yellow-400 text-lg py-6 px-8">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
'use client'
import { Product } from '@prisma/client'
import useEmblaCarousel from 'embla-carousel-react'
import { type EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay' // <-- নতুন: অটোপ্লে প্লাগইন ইম্পোর্ট করা হয়েছে
import ProductCard from './ProductCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback } from 'react'

interface ProductCarouselProps {
  products: Product[]
  title: string
  autoplay?: boolean // <-- নতুন: autoplay নামে একটি ঐচ্ছিক prop যোগ করা হয়েছে
}

export default function ProductCarousel({ products, title, autoplay = false }: ProductCarouselProps) {
  const options: EmblaOptionsType = {
    align: 'start',
    loop: true,
  }
  
  // পরিবর্তন: প্লাগইনটি এখানে শর্তসাপেক্ষে যোগ করা হয়েছে
  const plugins = autoplay ? [Autoplay({ delay: 4000, stopOnInteraction: false })] : []

  const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins)

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-serif text-4xl font-bold text-dark">{title}</h2>
          <div className="flex gap-2">
            <button onClick={scrollPrev} className="p-2 rounded-full bg-white border shadow-md hover:bg-gray-100 transition">
              <ChevronLeft />
            </button>
            <button onClick={scrollNext} className="p-2 rounded-full bg-white border shadow-md hover:bg-gray-100 transition">
              <ChevronRight />
            </button>
          </div>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {products.map((product) => (
              <div className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4 py-4" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
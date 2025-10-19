import prisma from '@/lib/prisma';
import Image from 'next/image';
import AnimatedSection from '@/components/AnimatedSection';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

async function getPortfolioData() {
  return prisma.portfolioArticle.findFirst({
    include: { 
        images: { orderBy: { id: 'desc' } }
    },
  });
}

export default async function PortfolioPage() {
  const portfolio = await getPortfolioData();

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Portfolio Under Construction</h1>
          <p className="text-gray-500 mt-2">The gallery is being curated. Please check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <AnimatedSection>
        <div className="py-24 bg-white text-center">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
              {portfolio.title}
            </h1>
          </div>
        </div>
      </AnimatedSection>
      
      {/* Article Section */}
      <AnimatedSection>
        <div className="container mx-auto px-4 -mt-12">
          <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-md border border-gray-100">
            <article
              className="prose prose-lg lg:prose-xl max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: portfolio.content }}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Gallery Section */}
      <AnimatedSection>
        <div className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
              Our Gallery in Pictures
            </h2>
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
              {portfolio.images.map((item) => (
                <div key={item.id} className="break-inside-avoid overflow-hidden rounded-xl shadow hover:shadow-lg transition-all duration-300">
                  <Zoom>
                    <Image
                      src={item.imageUrl}
                      alt={item.caption || 'Portfolio Image'}
                      width={500}
                      height={500}
                      className="w-full h-auto object-cover cursor-zoom-in transition-transform duration-300 hover:scale-[1.02]"
                    />
                  </Zoom>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

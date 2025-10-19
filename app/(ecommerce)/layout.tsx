import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Poppins, Lora } from 'next/font/google';
import prisma from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { SecondaryNav } from "@/components/SecondaryNav";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import FlyingCartAnimation from "@/components/FlyingCartAnimation";
import QuickViewModal from "@/components/QuickViewModal";
import { Suspense } from "react"; // <-- Suspense ইম্পোর্ট করা হয়েছে

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
});

export const metadata = {
  title: "Zamzam Mushroom",
  description: "Your one-stop shop for fresh mushrooms!",
};

async function getNavigationData() {
    const productTypes = Object.values(ProductType);
    const navData = [];

    for (const type of productTypes) {
        const categories = await prisma.category.findMany({
            where: { products: { some: { type: type, status: 'LIVE' } } },
            select: { id: true, name: true }
        });
        if (categories.length > 0) {
            navData.push({ type, categories });
        }
    }
    return navData;
}

async function getLogoUrl() {
    try {
        const logoSetting = await prisma.siteSetting.findUnique({ where: { key: 'logoUrl' } });
        return logoSetting?.value || null;
    } catch (error) {
        // ডাটাবেস কানেক্ট না হলেও যেন সাইট ক্র্যাশ না করে
        console.error("Could not fetch logo URL. Falling back to default.");
        return null;
    }
}

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
    const navData = await getNavigationData();
    const logoUrl = await getLogoUrl();
    
    return (
      <html lang="en" className={`${poppins.variable} ${lora.variable}`}> 
        <body suppressHydrationWarning={true}>
          <Providers>
            <Header logoUrl={logoUrl} />
            
            {/* মূল সমাধান: SecondaryNav-কে Suspense দিয়ে 감싸 দেওয়া হয়েছে */}
            <Suspense fallback={<div className="h-14 bg-white border-b" />}>
              <SecondaryNav navData={navData} />
            </Suspense>
            
            <FlyingCartAnimation />
            <QuickViewModal />

            <PageTransitionWrapper>
              <main className="bg-gray-50 min-h-screen">{children}</main>
            </PageTransitionWrapper>
            
            <Footer />
          </Providers>
        </body>
      </html>
    );
}
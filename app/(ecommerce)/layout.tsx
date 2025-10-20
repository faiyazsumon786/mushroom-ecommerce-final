import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Poppins, Lora } from 'next/font/google';
import prisma from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { SecondaryNav } from "@/components/SecondaryNav";
import NextTopLoader from 'nextjs-toploader'; // <-- টপ-লোডার ইম্পোর্ট করা হয়েছে
import FlyingCartAnimation from "@/components/FlyingCartAnimation";
import QuickViewModal from "@/components/QuickViewModal";
import { Suspense } from "react";

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
        return null;
    }
}

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
    const navData = await getNavigationData();
    const logoUrl = await getLogoUrl();
    
    return (
      <html lang="en" className={`${poppins.variable} ${lora.variable}`}> 
        <body suppressHydrationWarning={true}>
          {/* ✅ টপ-লোডিং বারটি এখানে সঠিকভাবে যোগ করা হয়েছে */}
          <NextTopLoader
            color="#0d9488"
            height={3}
            showSpinner={false}
            easing="ease"
            speed={200}
          />
          <Providers>
            <Header logoUrl={logoUrl} />
            
            <Suspense fallback={<div className="h-14 bg-white border-b" />}>
              <SecondaryNav navData={navData} />
            </Suspense>
            
            <FlyingCartAnimation />
            <QuickViewModal />

            {/* ❌ PageTransitionWrapper এখান থেকে সরিয়ে ফেলা হয়েছে */}
            <main className="bg-gray-50 min-h-screen">{children}</main>
            
            <Footer />
          </Providers>
        </body>
      </html>
    );
}
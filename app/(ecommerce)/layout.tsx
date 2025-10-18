import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Poppins, Lora } from 'next/font/google';
import prisma from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { SecondaryNav } from "@/components/SecondaryNav";
import PageTransitionWrapper from "@/components/PageTransitionWrapper"; // পেজ ট্রানজিশন অ্যানিমেশন
import FlyingCartAnimation from "@/components/FlyingCartAnimation";   // কার্ট অ্যানিমেশন
import QuickViewModal from "@/components/QuickViewModal";         // Quick View Modal

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
            where: {
                products: {
                    some: { type: type, status: 'LIVE' }
                }
            },
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
        const logoSetting = await prisma.siteSetting.findUnique({
            where: { key: 'logoUrl' },
        });
        return logoSetting?.value || null;
    } catch (error) {
        console.error("Could not fetch logo URL:", error);
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
            <SecondaryNav navData={navData} />
            
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
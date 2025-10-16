import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import FlyingCartAnimation from "@/components/FlyingCartAnimation";
import { Poppins, Lora } from 'next/font/google';
import prisma from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { SecondaryNav } from "@/components/SecondaryNav";
import NextTopLoader from 'nextjs-toploader';

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
                    some: {
                        type: type,
                        status: 'LIVE'
                    }
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

// এই ফাংশনটি ডাটাবেস থেকে লোগো URL আনবে
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
          {/* এইখানে নতুন লোডিং বারটি যোগ করা হয়েছে */}
          <NextTopLoader
            color="#2a9d8f" // আপনার ব্র্যান্ডের সবুজ কালার
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #2299DD,0 0 5px #2299DD"
          />
          <Providers>
            <Header logoUrl={logoUrl} />
            <SecondaryNav navData={navData} />
            <FlyingCartAnimation />
            <main className="bg-gray-50">{children}</main>
            <Footer />
          </Providers>
        </body>
      </html>
    );
}
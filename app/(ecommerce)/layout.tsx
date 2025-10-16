import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Poppins, Lora } from 'next/font/google';
import prisma from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { SecondaryNav } from "@/components/SecondaryNav";

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

// This function fetches the categories for each product type
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


export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
    const navData = await getNavigationData();
    const logoUrl = await prisma.siteSetting.findUnique({ where: { key: 'logoUrl' } }).then(s => s?.value || null);
    
    return (
      <html lang="en" className={`${poppins.variable} ${lora.variable}`}> 
        <body>
          <Providers>
            <Header logoUrl={logoUrl} />
            <SecondaryNav navData={navData} />
            <main className="bg-gray-50">{children}</main>
            <Footer />
          </Providers>
        </body>
      </html>
    );
}
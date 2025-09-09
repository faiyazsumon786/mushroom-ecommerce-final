import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-poppins",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans bg-white text-gray-900 min-h-screen flex flex-col">
        <Providers>
          <Toaster position="top-center" />
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mushroom LOTA",
  description: "Your one-stop shop for fresh mushrooms!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Providers কম্পোনেন্টটি children-কে 감싸চ্ছে, যা সঠিক প্যাটার্ন */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
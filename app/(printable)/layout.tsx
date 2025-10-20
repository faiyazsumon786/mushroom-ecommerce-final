// src/app/(printable)/layout.tsx
import React from 'react';
import '../globals.css';
import { Poppins } from 'next/font/google'; // সুন্দর ফন্টের জন্য

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'] 
});

export default function PrintableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.className}>
      {/* একটি ব্যাকগ্রাউন্ড কালার যোগ করা হয়েছে */}
      <body className="bg-gray-100">
        {children}
      </body>
    </html>
  );
}
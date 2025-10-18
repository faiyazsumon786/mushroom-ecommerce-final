'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CartIcon from './CartIcon';
import AccountLink from './AccountLink';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  logoUrl: string | null;
}

export default function Header({ logoUrl }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/blog", label: "Blog" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          
          <div className="flex-shrink-0">
            <Link href="/">
              {logoUrl ? (
                <Image src={logoUrl} alt="Zamzam Mushroom Logo" width={70} height={50} priority />
              ) : (
                <span className="text-2xl font-bold text-gray-800 font-serif">🍄 Zamzam Mushroom</span>
              )}
            </Link>
          </div>

          {/* ডেস্কটপ নেভিগেশন */}
          <nav className="hidden md:flex gap-8 text-lg font-medium text-gray-600">
            {navLinks.map(link => {
              const isActive = link.href === '/' 
                ? pathname === link.href 
                : pathname.startsWith(link.href);
              
              return (
                <Link key={link.href} href={link.href} className={`transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:transition-all after:duration-300 ${
                  isActive 
                    ? 'text-dark font-semibold after:bg-dark after:w-full' // <-- পরিবর্তন: active কালার এখন 'dark'
                    : 'text-gray-500 hover:text-dark after:w-0 hover:after:w-full after:bg-dark'
                }`}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <CartIcon />
              <AccountLink />
            </div>
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>
      </header>

      {/* মোবাইল মেন্যু */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-20 left-0 w-full bg-white shadow-lg z-40"
          >
            <nav className="flex flex-col items-center p-8 space-y-6">
              {navLinks.map(link => {
                const isActive = link.href === '/' 
                  ? pathname === link.href 
                  : pathname.startsWith(link.href);

                return (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={`text-xl transition-colors ${
                      isActive ? 'text-dark font-bold' : 'text-gray-700 hover:text-dark' // <-- পরিবর্তন: active কালার এখন 'dark'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-6 border-t w-full flex justify-center items-center gap-8">
                <CartIcon />
                <AccountLink />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
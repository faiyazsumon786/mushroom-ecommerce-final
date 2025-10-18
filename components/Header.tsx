'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CartIcon from './CartIcon';
import AccountLink from './AccountLink';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  logoUrl: string | null;
}

export default function Header({ logoUrl }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          
          {/* Left Side: Dynamic Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Zamzam Mushroom Logo"
                  width={70}
                  height={50}
                  priority
                />
              ) : (
                <span className="text-2xl font-bold text-gray-800 font-serif">
                  🍄 Zamzam Mushroom
                </span>
              )}
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex gap-8 text-lg font-medium text-gray-600">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side: Actions & Mobile Menu Button */}
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

      {/* Mobile Menu Overlay */}
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
              {navLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="text-xl text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
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
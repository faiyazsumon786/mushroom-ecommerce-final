// src/components/Footer.tsx
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">🍄 Mushroom LOTA</h3>
            <p className="text-gray-400">Your trusted source for fresh, organic mushrooms.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul>
              <li><Link href="/products" className="text-gray-400 hover:text-white">All Products</Link></li>
              <li><Link href="/account" className="text-gray-400 hover:text-white">My Account</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-400">Dhaka, Bangladesh</p>
            <p className="text-gray-400">info@mushroomlota.com</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><FaFacebook size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><FaInstagram size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><FaYoutube size={24} /></a>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 py-6 mt-8 border-t border-gray-700">
          <p>&copy; {new Date().getFullYear()} Mushroom LOTA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
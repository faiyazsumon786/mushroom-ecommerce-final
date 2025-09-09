import Link from 'next/link';
import CartIcon from './CartIcon';
import AccountLink from './AccountLink';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
          🍄 Zamzam Mushroom
        </Link>
        <nav className="flex items-center space-x-6">
          <Link
            href="/products"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Products
          </Link>
          <CartIcon />
          <AccountLink />
        </nav>
      </div>
    </header>
  );
}
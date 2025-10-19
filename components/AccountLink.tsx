'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { FaUserCircle, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import { Button } from './ui/button';

export default function AccountLink() {
  const { data: session, status } = useSession();
  
  // সেশন লোড হওয়ার সময়
  if (status === 'loading') {
    return <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse"></div>;
  }

  // যখন ব্যবহারকারী লগইন করা অবস্থায় আছে
  if (status === 'authenticated') {
    const userRole = session.user.role;
    let href = '/';
    let label = 'My Account';

    if (userRole === 'ADMIN' || userRole === 'EMPLOYEE') {
      href = '/admin/overview';
      label = 'Dashboard'; // <-- অ্যাডমিনদের জন্য টেক্সট পরিবর্তন করা হয়েছে
    } else if (userRole === 'WHOLESALER') {
      href = '/wholesaler/dashboard';
      label = 'My Dashboard';
    } else if (userRole === 'SUPPLIER') {
      href = '/supplier/my-products';
      label = 'My Dashboard';
    } else { // CUSTOMER
      href = '/account';
      label = 'My Account';
    }

    return (
      <div className="flex items-center gap-4">
        <Link href={href} className="flex items-center gap-2 text-gray-700 hover:text-primary font-semibold transition-colors">
          <FaUserCircle className="text-xl" />
          <span>{label}</span>
        </Link>
        {/* লগ-আউট বাটন যোগ করা হয়েছে */}
        <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: '/' })}>
          <FaSignOutAlt className="text-red-500" />
        </Button>
      </div>
    );
  }

  // যখন ব্যবহারকারী লগইন করা অবস্থায় নেই
  return (
    <div className="flex items-center space-x-4">
      <Link href="/login" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
        <FaSignInAlt />
        <span>Login</span>
      </Link>
      <Link href="/signup" className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors">
        <FaUserPlus />
        <span>Sign Up</span>
      </Link>
    </div>
  );
}
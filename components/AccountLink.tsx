// src/components/AccountLink.tsx
'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaUserCircle, FaSignInAlt, FaUserPlus } from 'react-icons/fa'; // আইকন ইম্পোর্ট করুন

export default function AccountLink() {
  const { data: session, status } = useSession();
  
  // যখন সেশন লোড হচ্ছে
  if (status === 'loading') {
    return <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse"></div>;
  }

  // যখন ইউজার লগইন করা অবস্থায় আছে
  if (status === 'authenticated') {
    return (
      <Link href="/account" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors">
        <FaUserCircle className="text-xl" />
        <span>My Account</span>
      </Link>
    );
  }

  // যখন ইউজার লগ আউট করা অবস্থায় আছে
  if (status === 'unauthenticated') {
     return (
       <div className="flex items-center space-x-4">
         <Link href="/api/auth/signin" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
           <FaSignInAlt />
           <span>Login</span>
         </Link>
         <Link href="/signup" className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
           <FaUserPlus />
           <span>Sign Up</span>
         </Link>
       </div>
     )
  }

  return null;
}
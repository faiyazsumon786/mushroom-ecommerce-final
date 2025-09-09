// src/app/(dashboard)/components/SignOutButton.tsx
'use client';

import { signOut } from 'next-auth/react';
import { FaSignOutAlt } from 'react-icons/fa'; // আইকন ইম্পোর্ট করুন

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full mt-2 flex items-center gap-3 p-2 rounded text-sm text-red-400 hover:bg-red-900 hover:text-white transition-colors"
    >
      <FaSignOutAlt />
      <span>Sign Out</span>
    </button>
  );
}
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SidebarNav from './components/SidebarNav';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 
          bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-950
          text-gray-100 p-6 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white font-serif">
            Zamzam Admin
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-400" />
          </Button>
        </div>

        {/* ✅ Scrollable Sidebar Content (hidden scrollbar, smooth scroll) */}
        <div
          className="mt-6 flex-1 overflow-y-auto relative 
          [scrollbar-width:none] [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <SidebarNav userRole={session?.user?.role} />

          {/* ✅ Subtle gradient at bottom for scroll depth */}
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-gray-950/90 via-gray-900/40 to-transparent"></div>
        </div>

        {/* ✅ Sidebar Footer */}
        <footer className="pt-4 border-t border-gray-800 text-sm text-gray-400 text-center mt-4">
          © {new Date().getFullYear()} Zamzam Admin
        </footer>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 sm:px-6">
          {/* Hamburger Button (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <h1 className="text-lg sm:text-xl font-semibold text-gray-700">Dashboard</h1>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-gray-100"
              >
                <UserCircle className="h-5 w-5 text-gray-600" />
                <span className="hidden sm:inline text-gray-700 font-medium">
                  {session?.user?.name || 'Admin'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8 bg-gray-50">
          {children}
        </main>

        {/* ✅ Footer for Main Section */}
        <footer className="bg-white border-t text-center text-sm text-gray-500 py-4">
          © {new Date().getFullYear()} Zamzam Admin Panel. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

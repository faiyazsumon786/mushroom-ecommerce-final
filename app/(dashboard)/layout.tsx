import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // <-- ইম্পোর্ট পাথ পরিবর্তন করা হয়েছে
import SidebarNav from './components/SidebarNav';
import SignOutButton from './components/SignOutButton';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-red-600 text-lg font-semibold">Access Denied. Please login.</p>
      </div>
    );
  }

  const userRole = (session.user as SessionUser).role;

  return (
    <section className="flex h-screen w-full bg-gray-100 font-sans">
      <aside className="w-72 flex-shrink-0 bg-gray-800 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white select-none">🍄 Mushroom LOTA</h1>
          <p className="text-xs text-gray-400 select-none">Management Panel</p>
        </div>
        <SidebarNav userRole={userRole} />
        <div className="mt-auto pt-4 border-t border-gray-700">
          <p className="text-sm font-semibold text-gray-300 truncate select-none">
            {session.user.name || 'Guest'}
          </p>
          <p className="text-xs text-gray-400 select-none">Role: {userRole || 'N/A'}</p>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </section>
  );
}
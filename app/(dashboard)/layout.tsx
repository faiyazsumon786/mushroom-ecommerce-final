import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import SidebarNav from './components/SidebarNav';
import SignOutButton from './components/SignOutButton';

interface SessionUser {
  id?: string | null; // ID যোগ করা হয়েছে
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

  const user = session.user as SessionUser;

  return (
    <section className="flex h-screen w-full bg-gray-100 font-sans">
      <aside className="w-72 flex-shrink-0 bg-gray-800 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white select-none">🍄Zamzam Mushroom</h1>
          <p className="text-xs text-gray-400 select-none">Management Panel</p>
        </div>
        <SidebarNav userRole={user.role} />
        <div className="mt-auto pt-4 border-t border-gray-700">
          <p className="text-sm font-semibold text-gray-300 truncate select-none">
            {user.name || 'Guest'}
          </p>
          <p className="text-xs text-gray-400 select-none">Role: {user.role || 'N/A'}</p>
          
          {/* --- ডিবাগ করার জন্য এই অংশটি যোগ করা হয়েছে --- */}
          <div className="mt-2 p-2 bg-yellow-200 text-black rounded text-xs">
            <p className="font-bold">User ID:</p>
            <p className="break-all">{user.id}</p>
          </div>
          {/* ------------------------------------------- */}

          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </section>
  );
}
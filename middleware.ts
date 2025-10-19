import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  const userRole = token?.role as string;

  // --- নতুন এবং সঠিক নিয়ম ---

  // ১. যদি কেউ অ্যাডমিন লগইন পেজে যেতে চায়, তাকে সরাসরি যেতে দেওয়া হবে
  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  // ২. যদি কেউ লগইন না করে অ্যাডমিন প্যানেলের অন্য কোনো পেজে যাওয়ার চেষ্টা করে
  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/employee'))) {
    // তাকে অ্যাডমিন লগইন পেজে পাঠানো হবে
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  
  // ৩. যদি কেউ লগইন না করে অন্যান্য সুরক্ষিত পেজে যাওয়ার চেষ্টা করে
  if (!token && (pathname.startsWith('/account') || pathname.startsWith('/supplier') || pathname.startsWith('/wholesaler'))) {
      return NextResponse.redirect(new URL('/login', req.url));
  }

  // ৪. যদি লগইন করা থাকে, কিন্তু তার সঠিক role না থাকে
  if (token) {
    if ((pathname.startsWith('/admin') || pathname.startsWith('/employee')) && userRole !== 'ADMIN' && userRole !== 'EMPLOYEE') {
      return NextResponse.redirect(new URL('/admin/login?error=Unauthorized', req.url));
    }
    if (pathname.startsWith('/account') && userRole !== 'CUSTOMER') {
      return NextResponse.redirect(new URL('/login?error=Unauthorized', req.url));
    }
    if (pathname.startsWith('/wholesaler') && userRole !== 'WHOLESALER') {
        return NextResponse.redirect(new URL('/login?error=Unauthorized', req.url));
    }
    if (pathname.startsWith('/supplier') && userRole !== 'SUPPLIER') {
        return NextResponse.redirect(new URL('/login?error=Unauthorized', req.url));
    }
  }

  // যদি উপরের কোনো নিয়ম না ভাঙে, তাহলে তাকে তার গন্তব্যে যেতে দেওয়া হবে
  return NextResponse.next();
}

// এই matcher ঠিক করে দেয় middleware কোন কোন পেজে কাজ করবে
export const config = {
  matcher: [
    '/admin/:path*',
    '/employee/:path*',
    '/supplier/:path*',
    '/wholesaler/:path*',
    '/account/:path*',
  ],
};
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(request) {
    const { token } = request.nextauth
    const { pathname } = request.nextUrl

    // Role-based redirection logic for the main dashboard URL
    if (pathname.endsWith('/admin') || pathname.endsWith('/dashboard')) {
      const role = token?.role?.toUpperCase()
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/overview', request.url))
      }
      if (role === 'EMPLOYEE') {
        return NextResponse.redirect(new URL('/employee/orders', request.url))
      }
      if (role === 'WHOLESALER') {
        return NextResponse.redirect(new URL('/wholesaler/dashboard', request.url))
      }
      if (role === 'SUPPLIER') {
        return NextResponse.redirect(new URL('/supplier/stock', request.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/employee/:path*',
    '/wholesaler/:path*',
    '/supplier/:path*', // <-- Add this line to protect supplier routes
  ],
}
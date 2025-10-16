import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const userRole = req.nextauth.token?.role;
    const { pathname } = req.nextUrl;

    // Rule for Admin
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return new NextResponse("You are not authorized!");
    }
    
    // Rule for Employee
    if (pathname.startsWith('/employee') && userRole !== 'EMPLOYEE' && userRole !== 'ADMIN') {
      return new NextResponse("You are not authorized!");
    }

    // Rule for Supplier
    if (pathname.startsWith('/supplier') && userRole !== 'SUPPLIER') {
      return new NextResponse("You are not authorized!");
    }

    // FIX: Added the rule for Wholesaler
    if (pathname.startsWith('/wholesaler') && userRole !== 'WHOLESALER') {
      return new NextResponse("You are not authorized!");
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// This specifies which pages the middleware should run on
export const config = { 
    matcher: [
        "/admin/:path*",
        "/employee/:path*",
        "/supplier/:path*",
        "/wholesaler/:path*",
    ] 
};
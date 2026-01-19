// middleware.ts - Place this in the root of your Next.js app
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check if user is authenticated and is admin
    const userCookie = request.cookies.get('user');
    
    // If no cookie, redirect to sign in
    if (!userCookie) {
      return NextResponse.redirect(new URL('/user/pages/SignIn', request.url));
    }

    try {
      const user = JSON.parse(userCookie.value);
      
      // Check if user is admin
      if (!user.isAdmin || user.role !== 'admin') {
        // Not an admin, redirect to user dashboard
        return NextResponse.redirect(new URL('/user/pages/CreatorDashboard', request.url));
      }
    } catch (error) {
      // Invalid user data, redirect to sign in
      return NextResponse.redirect(new URL('/user/pages/SignIn', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: '/admin/:path*',
};
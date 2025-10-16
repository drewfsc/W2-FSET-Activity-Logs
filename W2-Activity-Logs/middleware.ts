import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Allow the request to continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // User is authenticated if token exists
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Protect these routes with authentication
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/activities/:path*',
    '/profile/:path*',
    '/schedule/:path*',
    '/reports/:path*',
    '/users/:path*',
    '/clients/:path*',
    '/api/activities/:path*',
    '/api/users/:path*',
    '/api/profile/:path*',
  ],
};

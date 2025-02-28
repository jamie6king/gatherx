import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// List of protected routes that require authentication
const protectedRoutes = [
  '/events/create',
  '/profile',
  '/settings',
];

export async function middleware(request: NextRequest) {
  // Debug: Log the current path
  console.log('Middleware: Processing path:', request.nextUrl.pathname);
  
  const token = request.cookies.get('token')?.value;
  
  // Debug: Log token presence
  console.log('Middleware: Token present:', !!token);

  // Check if the requested path matches any protected routes
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Debug: Log if route is protected
  console.log('Middleware: Is protected route:', isProtectedRoute);

  if (isProtectedRoute) {
    if (!token) {
      console.log('Middleware: No token found, redirecting to login');
      // Redirect to login if no token exists
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Create secret key
      const secretKey = new TextEncoder().encode(JWT_SECRET);
      
      // Verify token
      const { payload } = await jose.jwtVerify(token, secretKey);
      
      // Debug: Log successful verification
      console.log('Middleware: Token verified successfully');
      
      if (!payload) {
        console.log('Middleware: Token verification returned no payload');
        throw new Error('Invalid token - no payload');
      }

      // Token is valid, allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      // Debug: Log the specific error
      console.error('Middleware: Token verification failed:', error);

      // Clear the invalid token cookie and redirect
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('token');
      
      // Debug: Log the redirect
      console.log('Middleware: Redirecting to login with cookie cleanup');
      
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match exact routes and their subroutes
    '/events/create/:path*',
    '/profile/:path*',
    '/settings/:path*',
    // Also match the exact routes themselves
    '/events/create',
    '/profile',
    '/settings',
  ],
}; 
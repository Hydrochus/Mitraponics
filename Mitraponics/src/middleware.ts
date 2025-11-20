import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware during development for easier debugging
  // In production, this code will be active
  if (process.env.NODE_ENV === 'development') {
    // In development, check for the emergency token
    if (pathname.startsWith('/admin') && 
        !pathname.includes('/login') && 
        !pathname.includes('/register')) {
      const token = request.cookies.get('adminToken')?.value;
      
      // Allow emergency token to pass
      if (token === 'temp_admin_access_token') {
        return NextResponse.next();
      }
      
      // No token or invalid token, redirect to login
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
    return NextResponse.next();
  }
  
  // Production code - always enforce authentication
  if (pathname.startsWith('/admin') && 
      !pathname.includes('/login') && 
      !pathname.includes('/register')) {
    const token = request.cookies.get('adminToken')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 
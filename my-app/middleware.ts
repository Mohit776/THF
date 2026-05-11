import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the user is authenticated by looking for the auth_session cookie
  const isAuthenticated = request.cookies.has('auth_session');
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/delete-account'];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // If the user is NOT authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    // Redirect them to the login page
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If the user IS authenticated and trying to access the login page
  if (isAuthenticated && request.nextUrl.pathname === '/') {
    // Redirect them to the dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

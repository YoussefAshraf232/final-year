import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STATIC_PATHS = ['/_next', '/favicon.ico', '/api'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Token currently lives in localStorage, so proxy can only perform
  // soft checks. Real protection is enforced by the dashboard layout and API.
  // When the backend moves auth to HttpOnly cookies, enable redirects here.
  //
  // const token = request.cookies.get('token')?.value;
  // const isAuthRoute = pathname === '/login' || pathname === '/register';
  //
  // if (!token && !isAuthRoute) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }
  //
  // if (token && isAuthRoute) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

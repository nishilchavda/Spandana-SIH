import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The httpOnly 'token' cookie is readable here (server-side middleware)
  // even though client-side JS cannot access it — this is the key security benefit.
  const token = request.cookies.get('token')?.value;

  const isAuthRoute         = pathname === '/login' || pathname === '/signup';
  const isPublicRoute       = pathname === '/' || pathname === '/about' || isAuthRoute;
  const isCompleteProfile   = pathname === '/complete-profile';

  // ── Unauthenticated access to protected route ──────────────────────────
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ── Authenticated user trying to visit login/signup ────────────────────
  if (token && isAuthRoute) {
    // Redirect to dashboard; if profile is incomplete the check below will
    // catch them on that next request.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ── Enforce profile completion before accessing protected pages ─────────
  // We use a secondary non-httpOnly cookie 'pc' (profile complete) that the
  // backend sets alongside the auth cookie so middleware can read it without
  // a DB round-trip on every request.
  if (token && !isCompleteProfile && !isPublicRoute) {
    const profileComplete = request.cookies.get('pc')?.value === '1';
    if (!profileComplete) {
      return NextResponse.redirect(new URL('/complete-profile', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)'],
};

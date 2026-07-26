import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin-auth';

/**
 * Gate every /admin page and /api/admin route behind the signed session cookie.
 * The login page and the login API itself are exempt (otherwise you could never
 * authenticate). Unauthenticated page requests redirect to /admin/login;
 * unauthenticated API requests get a 401 JSON body.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public entry points inside the protected tree.
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const authed = await verifySessionToken(token);
  if (authed) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', req.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

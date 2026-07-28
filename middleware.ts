import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin-auth';

/**
 * Gate the /admin PAGES behind the signed session cookie (redirect to login).
 *
 * The /api/admin/* routes are intentionally NOT matched here: Edge middleware
 * buffers the request body with a size cap that truncates multi-file uploads
 * (breaking formData parsing), so those routes self-authenticate in the Node
 * runtime via requireAdmin() (lib/admin-guard). The login page is exempt so you
 * can actually sign in.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/admin/login') return NextResponse.next();

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  const loginUrl = new URL('/admin/login', req.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};

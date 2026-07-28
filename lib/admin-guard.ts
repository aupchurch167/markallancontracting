import 'server-only';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from './admin-auth';

/**
 * Route-level admin auth. Used instead of the Edge middleware for the
 * body-heavy /api/admin/* routes (file uploads): the middleware buffers the
 * request body with a size cap that truncates multi-photo uploads, so those
 * routes are excluded from the matcher and self-authenticate here in the Node
 * runtime, where there's no such cap.
 *
 * Returns a 401 response when not authenticated, or null when the caller may
 * proceed: `const denied = await requireAdmin(); if (denied) return denied;`
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (await verifySessionToken(token)) return null;
  return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
}

import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createSessionToken,
  isAdminAuthConfigured,
} from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!isAdminAuthConfigured) {
    return NextResponse.json(
      {
        error:
          'Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET (16+ chars) in the environment.',
      },
      { status: 503 },
    );
  }

  let password = '';
  try {
    const body = await req.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

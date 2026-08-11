import { NextResponse } from 'next/server';
import { createSubscriber } from '@/lib/links';
import { isDbConfigured } from '@/lib/db';

export const runtime = 'nodejs';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public email signup from the /links page. Honeypot + format guard. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
  if (typeof body.company === 'string' && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : '';
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email.' }, { status: 422 });
  }
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'Signup is not configured.' }, { status: 503 });
  }
  try {
    await createSubscriber(email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not subscribe.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

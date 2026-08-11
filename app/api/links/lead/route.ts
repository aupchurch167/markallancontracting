import { NextResponse } from 'next/server';
import { createLead } from '@/lib/links';
import { isDbConfigured } from '@/lib/db';

export const runtime = 'nodejs';

/** Public lead capture from the /links contact form. Honeypot + length guards. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field.
  if (typeof body.company === 'string' && body.company.trim()) {
    return NextResponse.json({ ok: true }); // silently accept + drop
  }

  const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
  const name = clip(body.name, 120);
  const phone = clip(body.phone, 40);
  const projectType = clip(body.projectType, 160);
  const notes = clip(body.notes, 2000);

  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone are required.' }, { status: 422 });
  }

  if (!isDbConfigured) {
    // Never lose a lead silently: surface the phone-fallback path to the UI.
    return NextResponse.json({ error: 'Lead storage is not configured.' }, { status: 503 });
  }

  try {
    await createLead({ name, phone, projectType, notes, source: 'links' });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

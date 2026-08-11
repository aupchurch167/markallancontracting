import { NextResponse } from 'next/server';
import { incrementButtonClick } from '@/lib/links';
import { isDbConfigured } from '@/lib/db';

export const runtime = 'nodejs';

/** Fire-and-forget click counter for /links buttons (navigator.sendBeacon). */
export async function POST(req: Request) {
  if (!isDbConfigured) return NextResponse.json({ ok: true });
  let id = '';
  try {
    const body = await req.json();
    id = typeof body.id === 'string' ? body.id : '';
  } catch {
    return NextResponse.json({ ok: true });
  }
  if (id) {
    try {
      await incrementButtonClick(id);
    } catch {
      /* analytics is best-effort */
    }
  }
  return NextResponse.json({ ok: true });
}

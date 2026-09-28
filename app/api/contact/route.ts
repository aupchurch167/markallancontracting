import { NextResponse } from 'next/server';
import { evaluateLeadRequest } from '@/lib/lead-attribution';

export const runtime = 'nodejs';

/**
 * Validation gate for the public scope forms (homepage and /contact).
 *
 * Those forms still submit with mailto: to the site email (hello@macont.com).
 * There is no Resend/SMTP/Formspree provider and no CRM webhook, so this route
 * does not send mail and does not store the lead. It checks leadSource, drops
 * the honeypot, and returns length-limited attribution for the mailto body.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  const decision = evaluateLeadRequest(body);
  if (decision.action === 'drop') {
    return NextResponse.json({ ok: true, dropped: true });
  }
  if (decision.action === 'reject') {
    return NextResponse.json({ error: decision.error }, { status: 422 });
  }
  return NextResponse.json({
    ok: true,
    leadSource: decision.leadSource,
    label: decision.label,
    attribution: decision.attribution,
  });
}

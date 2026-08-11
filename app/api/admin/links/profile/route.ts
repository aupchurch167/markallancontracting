import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-guard';
import { isDbConfigured } from '@/lib/db';
import { saveLinksProfile, getLinksProfile, type LinksProfile } from '@/lib/links';

export const runtime = 'nodejs';

/** Save the /links profile (copy, sections, socials, testimonials, area). */
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'The CMS database is not configured.' }, { status: 503 });
  }
  let body: Partial<LinksProfile>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }
  try {
    // Merge onto current so a partial save never drops fields.
    const current = await getLinksProfile();
    const next: LinksProfile = {
      ...current,
      ...body,
      sections: { ...current.sections, ...(body.sections || {}) },
      socials: body.socials ?? current.socials,
      testimonials: body.testimonials ?? current.testimonials,
      area: { ...current.area, ...(body.area || {}) },
    };
    await saveLinksProfile(next);
    revalidatePath('/links');
    return NextResponse.json({ ok: true, profile: next });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

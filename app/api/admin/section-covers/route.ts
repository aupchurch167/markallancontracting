import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSectionCovers, saveSectionCovers, type SectionCovers } from '@/lib/content';
import { isDbConfigured } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';

/** Load the project-type / service cover map. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ covers: { projectTypes: {}, services: {} }, configured: false });
  }
  try {
    const covers = await getSectionCovers();
    return NextResponse.json({ covers, configured: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load covers.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Save the whole cover map (URLs already uploaded via /api/admin/cover/upload). */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'The CMS database is not configured.' }, { status: 503 });
  }
  let body: SectionCovers;
  try {
    const raw = await req.json();
    body = {
      projectTypes: raw?.projectTypes && typeof raw.projectTypes === 'object' ? raw.projectTypes : {},
      services: raw?.services && typeof raw.services === 'object' ? raw.services : {},
    };
  } catch {
    return NextResponse.json({ error: 'Expected JSON.' }, { status: 400 });
  }
  try {
    await saveSectionCovers(body);
    revalidatePath('/');
    revalidatePath('/project-types');
    revalidatePath('/services');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

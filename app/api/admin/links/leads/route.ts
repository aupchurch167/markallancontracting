import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { isDbConfigured } from '@/lib/db';
import { listLeads, setLeadStatus, deleteLead, LEAD_STATUSES } from '@/lib/links';

export const runtime = 'nodejs';

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Export leads as CSV (?format=csv), else JSON list. */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) return NextResponse.json({ error: 'Not configured.' }, { status: 503 });

  const leads = await listLeads();
  const url = new URL(req.url);
  if (url.searchParams.get('format') !== 'csv') {
    return NextResponse.json({ leads });
  }

  const header = ['Name', 'Phone', 'Project', 'Notes', 'Status', 'Came in', 'Source'];
  const rows = leads.map((l) =>
    [l.name, l.phone, l.projectType, l.notes, l.status, l.createdAt, l.source].map((v) => csvCell(String(v ?? ''))).join(','),
  );
  const csv = [header.join(','), ...rows].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="mac-leads.csv"',
    },
  });
}

/** Update a lead's status: body { id, status }. */
export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) return NextResponse.json({ error: 'Not configured.' }, { status: 503 });
  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }
  if (!body.id || !body.status || !LEAD_STATUSES.includes(body.status as (typeof LEAD_STATUSES)[number])) {
    return NextResponse.json({ error: 'id and a valid status are required.' }, { status: 422 });
  }
  try {
    await setLeadStatus(body.id, body.status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed.' }, { status: 502 });
  }
}

/** Delete a lead: body { id }. */
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) return NextResponse.json({ error: 'Not configured.' }, { status: 503 });
  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 422 });
  try {
    await deleteLead(body.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Delete failed.' }, { status: 502 });
  }
}

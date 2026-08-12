import 'server-only';
import { randomUUID } from 'crypto';
import { query, queryOne, safeQuery, safeQueryOne, ensureSchema, isDbConfigured } from './db';

/**
 * Content layer for the /links link-in-bio page. Buttons, jobsite updates,
 * leads, and subscribers live in their own tables; profile copy + section
 * flags + socials + testimonials live in a singleton ('links-profile').
 *
 * Reads never throw (safeQuery) so the page always renders. On first use the
 * tables are seeded with the published defaults so the page is live at launch
 * without an admin visit. Testimonials are intentionally NOT seeded — the
 * handoff says ship real quotes or hide the section.
 */

// ---------- types ----------
export interface LinkButton {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: string;
  visible: boolean;
  sortOrder: number;
  clickCount: number;
}

export interface LinkUpdate {
  id: string;
  body: string;
  imageUrl: string | null;
  status: 'draft' | 'published';
  postedAt: string;
}

export interface LinkSocial {
  label: string;
  href: string;
  icon: string;
}

export interface LinkTestimonial {
  quote: string;
  name: string;
  role: string;
}

export interface LinkSections {
  updates: boolean;
  testimonials: boolean;
  map: boolean;
  contact: boolean;
  signup: boolean;
  stickyCall: boolean;
}

export interface LinksProfile {
  name: string;
  tagline: string;
  blurb: string;
  since: string;
  avatarUrl: string;
  /** Wide banner photo at the very top of the page. */
  coverUrl: string;
  socials: LinkSocial[];
  testimonials: LinkTestimonial[];
  sections: LinkSections;
  area: { note: string; bbox: string };
}

export interface LinkLead {
  id: string;
  name: string;
  phone: string;
  projectType: string;
  notes: string;
  status: string;
  source: string;
  createdAt: string;
}

export const LEAD_STATUSES = ['New', 'Called', 'Walkthrough set', 'Quoted', 'Closed'] as const;

// ---------- defaults (the published starting point, from links-data.js) ----------
const DEFAULT_PROFILE: LinksProfile = {
  name: 'Mark Allan Contracting',
  tagline: 'A family-owned general contractor.',
  blurb:
    'Commercial renovations and tenant buildouts across Metro Atlanta — restaurants, retail, office and warehouse conversions. 27 years and counting.',
  since: 'Est. 1998',
  avatarUrl: '',
  coverUrl: '',
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/markallancontracting/', icon: 'instagram' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/markallancontractinginc/', icon: 'linkedin' },
    { label: 'Facebook', href: '', icon: 'facebook' },
  ],
  testimonials: [],
  sections: { updates: true, testimonials: false, map: true, contact: true, signup: true, stickyCall: true },
  area: {
    note: 'Fulton, DeKalb, Gwinnett, Cobb, Hall and the surrounding counties.',
    bbox: '-84.72,33.60,-84.15,33.95',
  },
};

const DEFAULT_BUTTONS: Omit<LinkButton, 'id' | 'clickCount'>[] = [
  { label: 'Call or text us', sublabel: '404-724-8709 — answered by a person', href: 'tel:4047248709', icon: 'phone', visible: true, sortOrder: 0 },
  { label: 'Schedule a buildout call', sublabel: '20 minutes, no charge', href: 'https://www.macont.com', icon: 'calendar-check', visible: true, sortOrder: 1 },
  { label: 'Scope of work template', sublabel: 'Free download for owners and managers', href: 'https://www.macont.com', icon: 'file-text', visible: true, sortOrder: 2 },
  { label: 'Email the office', sublabel: 'hello@macont.com', href: 'mailto:hello@macont.com', icon: 'envelope', visible: true, sortOrder: 3 },
  { label: 'See past projects', sublabel: 'macont.com — full portfolio', href: 'https://www.macont.com/projects', icon: 'buildings', visible: true, sortOrder: 4 },
];

const DEFAULT_UPDATES: { body: string; daysAgo: number }[] = [
  {
    body: "Your lease starts in 60 days and the space is still an empty box. Every week it stays that way is rent with no revenue behind it. We do buildouts and tenant improvements across Metro Atlanta — call and we'll walk the space with you this week.",
    daysAgo: 14,
  },
  { body: "Progress on the Verizon Wireless store we're building out in the Glenwood neighborhood. Framing and rough-ins done, finishes next.", daysAgo: 60 },
  { body: 'Wrapped up at the ABA clinic in Austell — partitions, ceilings, flooring and finishes, turned over on schedule.', daysAgo: 130 },
];

// ---------- seed (idempotent; inserts defaults only when a table is empty) ----------
let seeded: Promise<void> | null = null;
async function ensureLinksSeed(): Promise<void> {
  if (!isDbConfigured) return;
  if (seeded) return seeded;
  seeded = (async () => {
    await ensureSchema();
    const btn = await queryOne<{ n: string }>(`SELECT count(*) AS n FROM link_buttons`);
    if (btn && Number(btn.n) === 0) {
      for (const b of DEFAULT_BUTTONS) {
        await query(
          `INSERT INTO link_buttons (id, label, sublabel, href, icon, visible, sort_order, click_count)
           VALUES ($1,$2,$3,$4,$5,$6,$7,0)`,
          [randomUUID(), b.label, b.sublabel, b.href, b.icon, b.visible, b.sortOrder],
        );
      }
    }
    const upd = await queryOne<{ n: string }>(`SELECT count(*) AS n FROM link_updates`);
    if (upd && Number(upd.n) === 0) {
      for (const u of DEFAULT_UPDATES) {
        await query(
          `INSERT INTO link_updates (id, body, image_url, status, posted_at)
           VALUES ($1,$2,NULL,'published', now() - ($3 || ' days')::interval)`,
          [randomUUID(), u.body, String(u.daysAgo)],
        );
      }
    }
    const prof = await queryOne<{ value: unknown }>(`SELECT value FROM singletons WHERE key = 'links-profile'`);
    if (!prof) {
      await query(
        `INSERT INTO singletons (key, value, updated_at) VALUES ('links-profile', $1::jsonb, now())
         ON CONFLICT (key) DO NOTHING`,
        [JSON.stringify(DEFAULT_PROFILE)],
      );
    }
  })().catch((err) => {
    console.warn('[links] seed skipped:', (err as Error).message);
  });
  return seeded;
}

// ---------- profile ----------
export async function getLinksProfile(): Promise<LinksProfile> {
  await ensureLinksSeed();
  const row = await safeQueryOne<{ value: Partial<LinksProfile> }>(
    `SELECT value FROM singletons WHERE key = 'links-profile'`,
  );
  const v = row?.value || {};
  return {
    ...DEFAULT_PROFILE,
    ...v,
    sections: { ...DEFAULT_PROFILE.sections, ...(v.sections || {}) },
    socials: v.socials?.length ? v.socials : DEFAULT_PROFILE.socials,
    testimonials: v.testimonials || [],
    area: { ...DEFAULT_PROFILE.area, ...(v.area || {}) },
  };
}

export async function saveLinksProfile(value: LinksProfile): Promise<void> {
  await ensureSchema();
  await query(
    `INSERT INTO singletons (key, value, updated_at) VALUES ('links-profile', $1::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = $1::jsonb, updated_at = now()`,
    [JSON.stringify(value)],
  );
}

// ---------- buttons ----------
interface ButtonRow {
  id: string;
  label: string;
  sublabel: string | null;
  href: string;
  icon: string | null;
  visible: boolean;
  sort_order: number;
  click_count: number;
}
const toButton = (r: ButtonRow): LinkButton => ({
  id: r.id,
  label: r.label,
  sublabel: r.sublabel || '',
  href: r.href,
  icon: r.icon || 'link',
  visible: r.visible,
  sortOrder: r.sort_order,
  clickCount: r.click_count,
});

/** Visible buttons for the public page, in order. */
export async function getPublicButtons(): Promise<LinkButton[]> {
  await ensureLinksSeed();
  const rows = await safeQuery<ButtonRow>(
    `SELECT * FROM link_buttons WHERE visible = true ORDER BY sort_order ASC, created_at ASC`,
  );
  return rows.map(toButton);
}

/** All buttons for the admin, in order. */
export async function listButtons(): Promise<LinkButton[]> {
  await ensureLinksSeed();
  const rows = await safeQuery<ButtonRow>(
    `SELECT * FROM link_buttons ORDER BY sort_order ASC, created_at ASC`,
  );
  return rows.map(toButton);
}

export interface ButtonInput {
  id?: string;
  label: string;
  sublabel?: string;
  href: string;
  icon?: string;
  visible?: boolean;
}

export async function saveButton(input: ButtonInput): Promise<string> {
  await ensureSchema();
  if (input.id) {
    await query(
      `UPDATE link_buttons SET label=$2, sublabel=$3, href=$4, icon=$5, visible=$6, updated_at=now() WHERE id=$1`,
      [input.id, input.label, input.sublabel || null, input.href, input.icon || 'link', input.visible !== false],
    );
    return input.id;
  }
  const id = randomUUID();
  const max = await queryOne<{ m: number | null }>(`SELECT max(sort_order) AS m FROM link_buttons`);
  const nextOrder = (max?.m ?? -1) + 1;
  await query(
    `INSERT INTO link_buttons (id, label, sublabel, href, icon, visible, sort_order, click_count)
     VALUES ($1,$2,$3,$4,$5,$6,$7,0)`,
    [id, input.label, input.sublabel || null, input.href, input.icon || 'link', input.visible !== false, nextOrder],
  );
  return id;
}

export async function deleteButton(id: string): Promise<void> {
  await query(`DELETE FROM link_buttons WHERE id = $1`, [id]);
}

/** Persist an explicit id order (0-based). */
export async function reorderButtons(orderedIds: string[]): Promise<void> {
  await ensureSchema();
  for (let i = 0; i < orderedIds.length; i++) {
    await query(`UPDATE link_buttons SET sort_order=$2, updated_at=now() WHERE id=$1`, [orderedIds[i], i]);
  }
}

export async function incrementButtonClick(id: string): Promise<void> {
  await query(`UPDATE link_buttons SET click_count = click_count + 1 WHERE id = $1`, [id]);
}

// ---------- updates ----------
interface UpdateRow {
  id: string;
  body: string;
  image_url: string | null;
  status: string;
  posted_at: string;
}
const toUpdate = (r: UpdateRow): LinkUpdate => ({
  id: r.id,
  body: r.body,
  imageUrl: r.image_url,
  status: r.status === 'draft' ? 'draft' : 'published',
  postedAt: r.posted_at,
});

/** Published updates for the public page (most recent first). */
export async function getPublicUpdates(limit = 3): Promise<LinkUpdate[]> {
  await ensureLinksSeed();
  const rows = await safeQuery<UpdateRow>(
    `SELECT * FROM link_updates WHERE status = 'published' ORDER BY posted_at DESC LIMIT $1`,
    [limit],
  );
  return rows.map(toUpdate);
}

export async function listUpdates(): Promise<LinkUpdate[]> {
  await ensureLinksSeed();
  const rows = await safeQuery<UpdateRow>(`SELECT * FROM link_updates ORDER BY posted_at DESC`);
  return rows.map(toUpdate);
}

export interface UpdateInput {
  id?: string;
  body: string;
  imageUrl?: string | null;
  status: 'draft' | 'published';
}

export async function saveUpdate(input: UpdateInput): Promise<string> {
  await ensureSchema();
  if (input.id) {
    await query(
      `UPDATE link_updates SET body=$2, image_url=$3, status=$4, updated_at=now() WHERE id=$1`,
      [input.id, input.body, input.imageUrl ?? null, input.status],
    );
    return input.id;
  }
  const id = randomUUID();
  await query(
    `INSERT INTO link_updates (id, body, image_url, status, posted_at) VALUES ($1,$2,$3,$4, now())`,
    [id, input.body, input.imageUrl ?? null, input.status],
  );
  return id;
}

export async function deleteUpdate(id: string): Promise<void> {
  await query(`DELETE FROM link_updates WHERE id = $1`, [id]);
}

// ---------- leads ----------
interface LeadRow {
  id: string;
  name: string | null;
  phone: string | null;
  project_type: string | null;
  notes: string | null;
  status: string;
  source: string | null;
  created_at: string;
}
const toLead = (r: LeadRow): LinkLead => ({
  id: r.id,
  name: r.name || '',
  phone: r.phone || '',
  projectType: r.project_type || '',
  notes: r.notes || '',
  status: r.status,
  source: r.source || '',
  createdAt: r.created_at,
});

export async function createLead(input: {
  name: string;
  phone: string;
  projectType?: string;
  notes?: string;
  source?: string;
}): Promise<string> {
  await ensureSchema();
  const id = randomUUID();
  await query(
    `INSERT INTO link_leads (id, name, phone, project_type, notes, status, source)
     VALUES ($1,$2,$3,$4,$5,'New',$6)`,
    [id, input.name, input.phone, input.projectType || null, input.notes || null, input.source || 'links'],
  );
  return id;
}

export async function listLeads(): Promise<LinkLead[]> {
  await ensureSchema();
  const rows = await safeQuery<LeadRow>(`SELECT * FROM link_leads ORDER BY created_at DESC`);
  return rows.map(toLead);
}

export async function setLeadStatus(id: string, status: string): Promise<void> {
  await query(`UPDATE link_leads SET status = $2 WHERE id = $1`, [id, status]);
}

export async function deleteLead(id: string): Promise<void> {
  await query(`DELETE FROM link_leads WHERE id = $1`, [id]);
}

// ---------- subscribers ----------
export async function createSubscriber(email: string): Promise<void> {
  await ensureSchema();
  await query(
    `INSERT INTO link_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
    [email.toLowerCase()],
  );
}

export async function listSubscribers(): Promise<{ email: string; createdAt: string }[]> {
  await ensureSchema();
  const rows = await safeQuery<{ email: string; created_at: string }>(
    `SELECT email, created_at FROM link_subscribers ORDER BY created_at DESC`,
  );
  return rows.map((r) => ({ email: r.email, createdAt: r.created_at }));
}

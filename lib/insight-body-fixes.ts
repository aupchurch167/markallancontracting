/**
 * Exact text edits from PR #14, applied to a post body only where the old
 * wording is still present. A second run finds nothing to replace.
 *
 * These three slugs are published in Postgres (`posts.body_markdown`). The
 * repo markdown is what renders when that row is missing. The startup fix
 * uses this function to patch the published rows in place.
 */

export const INSIGHT_FIX_SLUGS = [
  'emergency-roof-tarping',
  'residential-fire-damage',
  'demo-phase',
] as const;

export type InsightFixSlug = (typeof INSIGHT_FIX_SLUGS)[number];

export interface InsightBodyFix {
  next: string;
  changed: boolean;
  /** Human-readable notes for the rows that actually changed. */
  edits: string[];
}

const EM_DASH = '\u2014';

/** Window cells that made the two tarping rows unpublishable. */
const TARPING_VERIFY_MARKERS = [
  '[VERIFY: MAC standard dispatch window for emergency calls]',
  '[VERIFY: typical tarp install duration for a single roof section]',
] as const;

const FIRE_REPLACEMENTS: ReadonlyArray<readonly [string, string, string]> = [
  [
    'xactimate scope sentence',
    `**scope of work** ${EM_DASH} usually written in Xactimate ${EM_DASH} becomes the budget.`,
    `company's **scope of work** ${EM_DASH} usually written in Xactimate, the insurance company's estimating tool ${EM_DASH} becomes the budget.`,
  ],
  [
    'rebuild timing cell',
    'After the insurance scope is agreed',
    'After the insurance company approves the scope',
  ],
  [
    'insurer reconciled cell',
    "Insurer scope reconciled with contractor's estimate",
    'Insurance company approves the scope',
  ],
  ['scope agreed phase', '1. Scope agreed', '1. Scope approved'],
  ['permit prerequisite cell', '| Scope agreed |', '| Scope approved |'],
  [
    'scope negotiation sentence',
    'It depends on how much structure was lost and how fast the insurance scope is agreed. The scope negotiation is usually the longest single delay, not the construction.',
    'It depends on how much structure was lost and how fast the insurance company approves the scope. Waiting on the insurance company to approve the scope is usually the longest single delay, not the construction.',
  ],
];

/** Live demo-phase sequence: header has 2 cells, delimiter has 3, first row has an empty third cell. */
const DEMO_TABLE_OLD = [
  '| Step | What happens |',
  '|---|---|---|',
  '| Protection and shutoffs | Mask storefront, cover what stays, kill power/water |  |',
  '| Ceilings and lighting | Tile, grid, fixtures out; systems exposed |',
  '| Walls | Selective removal, framing cut back |',
  '| Flooring | Carpet, VCT, tile, adhesive removal |',
  '| Haul-off and sweep | Dumpster loads, final clean for layout |',
].join('\n');

const DEMO_TABLE_NEW = [
  '| Step | What happens |',
  '| --- | --- |',
  '| Protection and shutoffs | Mask storefront, cover what stays, kill power/water |',
  '| Ceilings and lighting | Tile, grid, fixtures out; systems exposed |',
  '| Walls | Selective removal, framing cut back |',
  '| Flooring | Carpet, VCT, tile, adhesive removal |',
  '| Haul-off and sweep | Dumpster loads, final clean for layout |',
].join('\n');

function applyReplacements(
  body: string,
  replacements: ReadonlyArray<readonly [string, string, string]>,
): InsightBodyFix {
  let next = body;
  const edits: string[] = [];
  for (const [label, from, to] of replacements) {
    if (!next.includes(from)) continue;
    next = next.split(from).join(to);
    edits.push(label);
  }
  return { next, changed: next !== body, edits };
}

function fixTarping(body: string): InsightBodyFix {
  const edits: string[] = [];
  const next = body
    .split('\n')
    .filter((line) => {
      const hit = TARPING_VERIFY_MARKERS.find((marker) => line.includes(marker));
      if (!hit) return true;
      edits.push(`removed ${hit}`);
      return false;
    })
    .join('\n');
  return { next, changed: edits.length > 0, edits };
}

export type Sql = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>;

export type InsightFixRowResult = {
  slug: string;
  action: 'updated' | 'unchanged' | 'missing' | 'skipped-race';
  edits: string[];
};

export type InsightFixReport =
  | { skipped: true; reason: 'no-database-url' | 'retries-exhausted' }
  | { skipped: false; rows: InsightFixRowResult[] };

const MAX_ATTEMPTS = 3;
let cached: Promise<InsightFixReport> | null = null;
let attempts = 0;

/**
 * Patch the three published rows. Pass `query` from a test. With no
 * DATABASE_URL and no injected query, this returns without touching anything.
 * Updates `body_markdown` only. Never deletes a row. A second run is a no-op.
 */
export function applyPublishedInsightFixes(opts?: {
  query?: Sql;
  log?: (message: string) => void;
}): Promise<InsightFixReport> {
  const log = opts?.log ?? console.log;
  if (opts?.query) return runPublishedInsightFixes(opts.query, log);
  if (!process.env.DATABASE_URL) return Promise.resolve({ skipped: true, reason: 'no-database-url' });
  if (cached) return cached;
  if (attempts >= MAX_ATTEMPTS) return Promise.resolve({ skipped: true, reason: 'retries-exhausted' });
  attempts += 1;
  cached = (async () => {
    const { query } = await import('./db');
    return runPublishedInsightFixes(query as Sql, log);
  })().catch((err: unknown) => {
    cached = null;
    const message = err instanceof Error ? err.message : String(err);
    console.error('[insight-fix] failed:', message);
    throw err;
  });
  return cached;
}

async function runPublishedInsightFixes(query: Sql, log: (message: string) => void): Promise<InsightFixReport> {
  const found = await query<{ slug: string; body_markdown: string | null }>(
    `SELECT slug, body_markdown
     FROM posts
     WHERE status = 'published' AND slug = ANY($1::text[])`,
    [Array.from(INSIGHT_FIX_SLUGS)],
  );
  const bySlug = new Map(found.map((row) => [row.slug, row.body_markdown]));
  const rows: InsightFixRowResult[] = [];

  for (const slug of INSIGHT_FIX_SLUGS) {
    if (!bySlug.has(slug)) {
      log(`[insight-fix] ${slug}: no published row, nothing updated`);
      rows.push({ slug, action: 'missing', edits: [] });
      continue;
    }
    const original = bySlug.get(slug) ?? null;
    const fix = applyInsightBodyFix(slug, original ?? '');
    if (!fix.changed) {
      log(`[insight-fix] ${slug}: unchanged (old text not present)`);
      rows.push({ slug, action: 'unchanged', edits: [] });
      continue;
    }
    const updated = await query<{ slug: string }>(
      `UPDATE posts
       SET body_markdown = $1
       WHERE slug = $2
         AND status = 'published'
         AND body_markdown IS NOT DISTINCT FROM $3
       RETURNING slug`,
      [fix.next, slug, original],
    );
    if (updated.length === 0) {
      log(`[insight-fix] ${slug}: skipped update (row changed since it was read)`);
      rows.push({ slug, action: 'skipped-race', edits: fix.edits });
      continue;
    }
    log(`[insight-fix] ${slug}: updated body_markdown (${fix.edits.join('; ')})`);
    rows.push({ slug, action: 'updated', edits: fix.edits });
  }

  return { skipped: false, rows };
}

/** Returns the body unchanged when `slug` is unknown or the old text is already gone. */
export function applyInsightBodyFix(slug: string, body: string): InsightBodyFix {
  if (slug === 'emergency-roof-tarping') return fixTarping(body);
  if (slug === 'residential-fire-damage') return applyReplacements(body, FIRE_REPLACEMENTS);
  if (slug === 'demo-phase') return applyReplacements(body, [['demo sequence table', DEMO_TABLE_OLD, DEMO_TABLE_NEW]]);
  return { next: body, changed: false, edits: [] };
}

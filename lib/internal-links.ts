import { SERVICE_LINES, SERVICES, MARKETS } from './site-data';

/**
 * Internal-linking for AI-generated posts. Weaves links to our own service,
 * project-type, and market pages into the body — conservative by design:
 *   - links only the FIRST mention of each target across the whole document
 *   - only inside normal paragraphs (headings/quotes/lists are left alone)
 *   - longest phrase first, so "restaurant buildout" wins over "buildout"
 *   - caps links per paragraph so copy never turns blue
 * This is the highest-leverage SEO win: it builds topical authority and funnels
 * readers from editorial pages toward the conversion (service) pages.
 */

export interface LinkTarget {
  phrase: string;
  path: string;
}

const MAX_LINKS_PER_PARAGRAPH = 2;

// Build the target list from the real site pages, plus a few natural synonyms.
const RAW_TARGETS: LinkTarget[] = [
  ...SERVICE_LINES.map((l) => ({ phrase: l.name, path: l.href })),
  ...SERVICES.map((s) => ({ phrase: s.name, path: `/project-types/${s.slug}` })),
  ...MARKETS.map((m) => ({ phrase: m.name, path: `/markets/${m.slug}` })),
  // Common singular / shorthand phrasings that map to the same pages.
  { phrase: 'tenant improvement', path: '/project-types/tenant-improvements' },
  { phrase: 'pre-construction services', path: '/pre-construction' },
  { phrase: 'warehouse conversions', path: '/project-types/warehouse-conversion' },
  { phrase: 'restaurant buildouts', path: '/project-types/restaurant-buildout' },
  { phrase: 'retail buildouts', path: '/project-types/retail-buildout' },
];

// Longest phrase first so specific names match before generic ones.
export const LINK_TARGETS: LinkTarget[] = [...RAW_TARGETS].sort(
  (a, b) => b.phrase.length - a.phrase.length,
);

const isAlnum = (c: string) => /[a-z0-9]/i.test(c);

/** First boundary-aware, case-insensitive index of `phrase` in `text`, or -1. */
function boundaryIndex(lowerText: string, lowerPhrase: string): number {
  let idx = lowerText.indexOf(lowerPhrase);
  while (idx !== -1) {
    const before = idx === 0 ? '' : lowerText[idx - 1];
    const afterPos = idx + lowerPhrase.length;
    const after = afterPos >= lowerText.length ? '' : lowerText[afterPos];
    if (!isAlnum(before) && !isAlnum(after)) return idx;
    idx = lowerText.indexOf(lowerPhrase, idx + 1);
  }
  return -1;
}

interface Match {
  start: number;
  end: number;
  path: string;
}

export interface LinkedSpan {
  text: string;
  href?: string;
}

/**
 * Split a paragraph into spans, linking the first unused target(s) it contains.
 * `used` tracks targets already linked earlier in the document so each links
 * once. Returns plain spans (with optional href) for the caller to turn into
 * Portable Text.
 */
export function linkifyParagraph(text: string, used: Set<string>): LinkedSpan[] {
  const lower = text.toLowerCase();
  const matches: Match[] = [];

  for (const target of LINK_TARGETS) {
    if (used.has(target.path)) continue;
    if (matches.length >= MAX_LINKS_PER_PARAGRAPH) break;
    const start = boundaryIndex(lower, target.phrase.toLowerCase());
    if (start === -1) continue;
    const end = start + target.phrase.length;
    // Skip if it overlaps, or duplicates the page of, a match we already chose.
    if (matches.some((m) => (start < m.end && end > m.start) || m.path === target.path)) continue;
    matches.push({ start, end, path: target.path });
  }

  if (matches.length === 0) return [{ text }];

  matches.sort((a, b) => a.start - b.start);
  const spans: LinkedSpan[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) spans.push({ text: text.slice(cursor, m.start) });
    spans.push({ text: text.slice(m.start, m.end), href: m.path });
    used.add(m.path);
    cursor = m.end;
  }
  if (cursor < text.length) spans.push({ text: text.slice(cursor) });
  return spans;
}

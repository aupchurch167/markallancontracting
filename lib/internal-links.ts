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

/** Collect up to `cap` non-overlapping matches of unused targets in `text`. */
function collectMatches(text: string, used: Set<string>, cap: number): Match[] {
  const lower = text.toLowerCase();
  const matches: Match[] = [];
  for (const target of LINK_TARGETS) {
    if (used.has(target.path)) continue;
    if (matches.length >= cap) break;
    const start = boundaryIndex(lower, target.phrase.toLowerCase());
    if (start === -1) continue;
    const end = start + target.phrase.length;
    if (matches.some((m) => (start < m.end && end > m.start) || m.path === target.path)) continue;
    matches.push({ start, end, path: target.path });
  }
  return matches.sort((a, b) => a.start - b.start);
}

/**
 * Split a paragraph into spans, linking the first unused target(s) it contains.
 * `used` tracks targets already linked earlier in the document so each links
 * once. Returns plain spans (with optional href) for the caller to turn into
 * Portable Text.
 */
export function linkifyParagraph(text: string, used: Set<string>): LinkedSpan[] {
  const matches = collectMatches(text, used, MAX_LINKS_PER_PARAGRAPH);
  if (matches.length === 0) return [{ text }];

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

/**
 * Weave internal links into a Markdown string. Skips headings, fenced code, and
 * standalone image lines; within text lines it protects existing links, images,
 * and inline code before matching, so it never links inside them. First mention
 * per target across the whole document (same rules as the Portable Text path).
 */
export function linkifyMarkdown(md: string): string {
  const used = new Set<string>();
  let inFence = false;
  return md
    .split('\n')
    .map((line) => {
      const t = line.trimStart();
      if (t.startsWith('```') || t.startsWith('~~~')) {
        inFence = !inFence;
        return line;
      }
      if (inFence || t === '' || t.startsWith('#') || t.startsWith('![')) return line;
      return linkifyLine(line, used);
    })
    .join('\n');
}

function linkifyLine(line: string, used: Set<string>): string {
  // Mask existing images, links, and inline code so we never link inside them.
  const store: string[] = [];
  const mask = (s: string) => {
    const token = `@@LM${store.length}LM@@`;
    store.push(s);
    return token;
  };
  let masked = line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, mask) // images (before links)
    .replace(/\[[^\]]*\]\([^)]*\)/g, mask) // links
    .replace(/`[^`]*`/g, mask); // inline code

  const matches = collectMatches(masked, used, MAX_LINKS_PER_PARAGRAPH);
  if (matches.length) {
    let out = '';
    let cursor = 0;
    for (const m of matches) {
      out += masked.slice(cursor, m.start);
      out += `[${masked.slice(m.start, m.end)}](${m.path})`;
      used.add(m.path);
      cursor = m.end;
    }
    out += masked.slice(cursor);
    masked = out;
  }

  return masked.replace(/@@LM(\d+)LM@@/g, (_, i) => store[Number(i)]);
}

import { randomUUID } from 'crypto';
import type { GenBlock } from './anthropic';
import { linkifyParagraph } from './internal-links';

/**
 * Convert the generator's simple block list into Sanity Portable Text
 * (the `blockContent` array shape). Headings/paragraphs/quotes become styled
 * blocks; bullets/numbers become one list-item block per entry. Normal
 * paragraphs are run through internal-linking so the body links our own
 * service/project-type/market pages (see lib/internal-links).
 */
function key() {
  return randomUUID().replace(/-/g, '').slice(0, 12);
}

type Span = { _type: 'span'; _key: string; text: string; marks: string[] };
type MarkDef = { _type: 'link'; _key: string; href: string };
type Block = {
  _type: 'block';
  _key: string;
  style: string;
  listItem?: 'bullet' | 'number';
  level?: number;
  markDefs: MarkDef[];
  children: Span[];
};
type ExternalImage = {
  _type: 'externalImage';
  _key: string;
  url: string;
  alt?: string;
  caption?: string;
};
type PTNode = Block | ExternalImage;

function plainBlock(style: string, text: string, listItem?: 'bullet' | 'number'): Block {
  return {
    _type: 'block',
    _key: key(),
    style,
    ...(listItem ? { listItem, level: 1 } : {}),
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  };
}

/** A normal paragraph with internal links woven in (first mention per target). */
function linkedParagraph(text: string, used: Set<string>): Block {
  const spans = linkifyParagraph(text, used);
  const markDefs: MarkDef[] = [];
  const children: Span[] = spans.map((s) => {
    if (!s.href) return { _type: 'span', _key: key(), text: s.text, marks: [] };
    const markKey = key();
    markDefs.push({ _type: 'link', _key: markKey, href: s.href });
    return { _type: 'span', _key: key(), text: s.text, marks: [markKey] };
  });
  return { _type: 'block', _key: key(), style: 'normal', markDefs, children };
}

/**
 * @param link when false, paragraphs are not internally linked (e.g. short
 *   project blurbs where linking would be noise). Defaults to true.
 * @param imageUrls maps a body image block's `imageIndex` to an R2 URL. Image
 *   blocks with no matching URL are dropped. Omit to strip images entirely.
 */
export function blocksToPortableText(
  blocks: GenBlock[] | undefined,
  { link = true, imageUrls }: { link?: boolean; imageUrls?: string[] } = {},
): PTNode[] {
  if (!Array.isArray(blocks)) return [];
  const used = new Set<string>();
  const out: PTNode[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'heading':
        if (b.text) out.push(plainBlock('h2', b.text));
        break;
      case 'subheading':
        if (b.text) out.push(plainBlock('h3', b.text));
        break;
      case 'quote':
        if (b.text) out.push(plainBlock('blockquote', b.text));
        break;
      case 'paragraph':
        if (b.text) out.push(link ? linkedParagraph(b.text, used) : plainBlock('normal', b.text));
        break;
      case 'bullets':
        for (const item of b.items || []) if (item) out.push(plainBlock('normal', item, 'bullet'));
        break;
      case 'numbers':
        for (const item of b.items || []) if (item) out.push(plainBlock('normal', item, 'number'));
        break;
      case 'image': {
        const url = imageUrls?.[b.imageIndex];
        if (url) {
          out.push({ _type: 'externalImage', _key: key(), url, alt: b.alt, caption: b.caption });
        }
        break;
      }
    }
  }
  return out;
}

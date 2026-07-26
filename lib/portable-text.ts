import { randomUUID } from 'crypto';
import type { GenBlock } from './anthropic';

/**
 * Convert the generator's simple block list into Sanity Portable Text
 * (the `blockContent` array shape). Headings/paragraphs/quotes become styled
 * blocks; bullets/numbers become one list-item block per entry.
 */
function key() {
  return randomUUID().replace(/-/g, '').slice(0, 12);
}

function textBlock(style: string, text: string) {
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  };
}

function listItemBlock(listItem: 'bullet' | 'number', text: string) {
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    listItem,
    level: 1,
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  };
}

export function blocksToPortableText(blocks: GenBlock[] | undefined) {
  if (!Array.isArray(blocks)) return [];
  const out: ReturnType<typeof textBlock>[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'heading':
        if (b.text) out.push(textBlock('h2', b.text));
        break;
      case 'subheading':
        if (b.text) out.push(textBlock('h3', b.text));
        break;
      case 'quote':
        if (b.text) out.push(textBlock('blockquote', b.text));
        break;
      case 'paragraph':
        if (b.text) out.push(textBlock('normal', b.text));
        break;
      case 'bullets':
        for (const item of b.items || []) if (item) out.push(listItemBlock('bullet', item));
        break;
      case 'numbers':
        for (const item of b.items || []) if (item) out.push(listItemBlock('number', item));
        break;
    }
  }
  return out;
}

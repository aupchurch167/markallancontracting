import type { ReactNode } from 'react';
import Link from 'next/link';
import { JsonLd } from './JsonLd';
import { faqSchema } from '@/lib/schema';
import { publicFaqAnswer } from '@/lib/public-copy';

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Render FAQ answer text, turning `[label](/path)` into in-page links.
 * Placeholder sentences are removed before this runs.
 */
function FaqAnswer({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(LINK.source, 'g');
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const [, label, href] = match;
    if (href.startsWith('/')) {
      nodes.push(
        <Link
          key={match.index}
          href={href}
          className="font-semibold text-maroon hover:text-maroon-dark"
        >
          {label}
        </Link>,
      );
    } else {
      nodes.push(
        <a
          key={match.index}
          href={href}
          className="font-semibold text-maroon hover:text-maroon-dark"
        >
          {label}
        </a>,
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

/**
 * Renders a genuine FAQ block + FAQPage schema. Only used where real questions
 * exist — never fabricate FAQs to earn the markup. Answers may include
 * `[label](/internal-path)` deep-links; schema flattens those to plain text.
 * A `{{PLACEHOLDER: …}}` sentence is left in the source and omitted here, so
 * the public page and the FAQ schema never show it. An answer that is only a
 * placeholder is omitted entirely.
 */
export function FAQ({ faqs }: { faqs: { q: string; a: string }[] }) {
  const visible = faqs.flatMap((f) => {
    const a = publicFaqAnswer(f.a);
    return a ? [{ q: f.q, a }] : [];
  });
  if (!visible.length) return null;
  const schema = faqSchema(visible);
  return (
    <div>
      {schema ? <JsonLd data={schema} /> : null}
      <dl className="divide-y divide-hairline">
        {visible.map((f) => (
          <div key={f.q} className="py-5">
            <dt className="text-lg font-semibold text-ink">{f.q}</dt>
            <dd className="mt-2 leading-relaxed text-body">
              <FaqAnswer text={f.a} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

import type { ReactNode } from 'react';
import Link from 'next/link';
import { JsonLd } from './JsonLd';
import { faqSchema } from '@/lib/schema';
import { Placeholder } from './Placeholder';

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const PLACEHOLDER = /\{\{PLACEHOLDER: ([^}]+)\}\}\s*/;

/**
 * Render FAQ answer text, turning `[label](/path)` into in-page links and a
 * leading-or-inline `{{PLACEHOLDER: …}}` into a visible staging mark.
 */
function FaqAnswer({ text }: { text: string }) {
  const ph = PLACEHOLDER.exec(text);
  if (ph) {
    return (
      <>
        <FaqAnswer text={text.slice(0, ph.index)} />
        <Placeholder>{ph[1]}</Placeholder>{' '}
        <FaqAnswer text={text.slice(ph.index + ph[0].length)} />
      </>
    );
  }
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
 * `{{PLACEHOLDER: …}}` renders as a staging mark and is left out of the schema.
 */
export function FAQ({ faqs }: { faqs: { q: string; a: string }[] }) {
  if (!faqs.length) return null;
  return (
    <div>
      <JsonLd data={faqSchema(faqs)} />
      <dl className="divide-y divide-hairline">
        {faqs.map((f) => (
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

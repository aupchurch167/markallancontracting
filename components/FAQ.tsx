import { JsonLd } from './JsonLd';
import { faqSchema } from '@/lib/schema';

/**
 * Renders a genuine FAQ block + FAQPage schema. Only used where real questions
 * exist — never fabricate FAQs to earn the markup.
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
            <dd className="mt-2 leading-relaxed text-body">{f.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

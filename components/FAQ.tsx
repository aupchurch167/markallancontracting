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
      <dl className="divide-y divide-stone-200">
        {faqs.map((f) => (
          <div key={f.q} className="py-5">
            <dt className="text-lg font-semibold text-navy">{f.q}</dt>
            <dd className="mt-2 leading-relaxed text-stone-600">{f.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

import Link from 'next/link';

export interface RelatedReadingItem {
  href: string;
  title: string;
  blurb: string;
}

/** Insight cards for money-page related-reading rows. */
export function RelatedReading({ items }: { items: RelatedReadingItem[] }) {
  if (!items.length) return null;
  const cols =
    items.length >= 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : items.length === 3
        ? 'sm:grid-cols-3'
        : 'sm:grid-cols-2';
  return (
    <div>
      <div className="mb-7 flex items-baseline justify-between">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">Related reading</h2>
        <Link href="/insights" className="text-sm font-semibold text-maroon hover:text-maroon-dark">
          All insights →
        </Link>
      </div>
      <div className={`grid gap-px border border-hairline bg-hairline ${cols}`}>
        {items.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="bg-paper p-7 transition-colors hover:bg-[#FFFFFF]"
          >
            <div className="font-display text-[22px] font-semibold uppercase leading-[1.05] text-ink">
              {r.title}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-body">{r.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

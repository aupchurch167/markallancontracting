/**
 * Compact numbered process strip — a thin teaser of how it works, placed just
 * under the hero so the reliability promise lands before the fuller "How it
 * works" section further down. Flat, on-system: hairline rules, maroon numerals.
 */
const PHASES = [
  { n: '01', title: 'Call us.', caption: 'Five minutes. We’ll tell you if we’re a fit.' },
  { n: '02', title: 'We walk the space.', caption: 'Measurements, conditions, real estimate.' },
  { n: '03', title: 'We build.', caption: 'One contact. Weekly updates. Photos from your phone.' },
];

export function ProcessStrip() {
  return (
    <section className="border-y-2 border-hairline bg-paper-alt">
      <div className="container-page py-8">
        <div className="grid gap-y-6 sm:grid-cols-3 sm:gap-y-0">
          {PHASES.map((p, i) => (
            <div
              key={p.n}
              className={
                i === 0
                  ? 'sm:pr-8'
                  : i === PHASES.length - 1
                    ? 'sm:border-l-2 sm:border-hairline sm:pl-8'
                    : 'sm:border-l-2 sm:border-hairline sm:px-8'
              }
            >
              <div className="text-xs font-bold tracking-[0.12em] text-maroon">{p.n}</div>
              <div className="mt-1.5 text-[15px] font-bold uppercase tracking-heading text-ink">
                {p.title}
              </div>
              <div className="mt-1 text-sm text-body">{p.caption}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 border-t-2 border-hairline pt-4 text-sm text-body">
          On urgent work, we’ve been on site the same day.
        </p>
      </div>
    </section>
  );
}

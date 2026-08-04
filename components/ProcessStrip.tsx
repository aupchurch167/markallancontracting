/**
 * Compact numbered process strip — a thin teaser of the build process placed
 * just under the hero, so the reliability promise lands before the user scrolls
 * to the fuller "How it works" section. Flat, on-system: brass rules and
 * numerals on the lighter bone surface.
 */
const PHASES = [
  { n: '01', title: 'Walk the space', caption: 'We ask the questions that change the price.' },
  { n: '02', title: 'Get a real number', caption: 'A scoped estimate, not a range.' },
  { n: '03', title: 'We build', caption: 'Crews mobilize. You get your space back.' },
];

export function ProcessStrip() {
  return (
    <section className="border-y-2 border-brass/50 bg-bone-light">
      <div className="container-page grid gap-y-6 py-8 sm:grid-cols-3 sm:gap-y-0">
        {PHASES.map((p, i) => (
          <div
            key={p.n}
            className={
              i === 0
                ? 'sm:pr-8'
                : i === PHASES.length - 1
                  ? 'sm:border-l-2 sm:border-brass/35 sm:pl-8'
                  : 'sm:border-l-2 sm:border-brass/35 sm:px-8'
            }
          >
            <div className="text-xs font-bold tracking-[0.12em] text-brass">{p.n}</div>
            <div className="mt-1.5 text-[15px] font-bold uppercase tracking-heading text-oxblood">
              {p.title}
            </div>
            <div className="mt-1 text-sm text-oxblood/65">{p.caption}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

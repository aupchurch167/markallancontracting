import Link from 'next/link';
import { SERVICES } from '@/lib/site-data';

/** Links to all 7 project-type pages. Used on the homepage and elsewhere. */
export function ServiceGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s) => (
        <Link
          key={s.slug}
          href={`/project-types/${s.slug}`}
          className="group border-2 border-brass/40 bg-bone p-6 transition-colors hover:border-brass hover:bg-bone-light"
        >
          <div className="text-lg font-bold uppercase tracking-heading text-oxblood group-hover:text-brass">
            {s.name}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-label text-brass">
            Learn more
            <span aria-hidden>→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

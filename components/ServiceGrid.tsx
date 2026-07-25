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
          className="group rounded-lg border border-stone-200 bg-paper p-6 transition-colors hover:border-accent hover:bg-stone-50"
        >
          <div className="text-lg font-semibold text-navy group-hover:text-accent">
            {s.name}
          </div>
          <div className="mt-2 flex items-center text-sm font-medium text-accent">
            Learn more
            <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

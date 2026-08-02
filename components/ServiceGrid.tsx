import Link from 'next/link';
import Image from 'next/image';
import { SERVICES } from '@/lib/site-data';
import { getSectionCovers } from '@/lib/content';

/** Links to all 7 project-type pages, each with its admin-set cover photo. */
export async function ServiceGrid() {
  const { projectTypes } = await getSectionCovers();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s) => {
        const cover = projectTypes[s.slug];
        return (
          <Link
            key={s.slug}
            href={`/project-types/${s.slug}`}
            className="group block border-2 border-brass/40 bg-bone transition-colors hover:border-brass"
          >
            {cover ? (
              <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
                <Image
                  src={cover}
                  alt={s.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="p-6">
              <div className="text-lg font-bold uppercase tracking-heading text-oxblood group-hover:text-brass">
                {s.name}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-label text-brass">
                Learn more
                <span aria-hidden>→</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

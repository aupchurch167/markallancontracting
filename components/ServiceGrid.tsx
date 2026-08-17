import Link from 'next/link';
import Image from 'next/image';
import { SERVICES } from '@/lib/site-data';
import { SERVICE_CONTENT } from '@/lib/fallback-content';
import { getSectionCovers } from '@/lib/content';

/** Links to all 7 project-type pages, each with its admin-set cover photo. */
export async function ServiceGrid() {
  const { projectTypes } = await getSectionCovers();
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {SERVICES.map((s) => {
        const cover = projectTypes[s.slug];
        const problem = SERVICE_CONTENT[s.slug]?.problem;
        return (
          <Link
            key={s.slug}
            href={`/project-types/${s.slug}`}
            className="group block border-2 border-hairline bg-paper transition-colors hover:border-hairline"
          >
            {cover ? (
              <div className="relative aspect-[16/9] overflow-hidden bg-paper-alt">
                <Image
                  src={cover}
                  alt={s.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="p-5 sm:p-6">
              <div className="text-base font-bold uppercase tracking-heading text-ink group-hover:text-maroon sm:text-lg">
                {s.name}
              </div>
              {problem ? (
                <p className="mt-1.5 line-clamp-1 text-sm text-body">{problem}</p>
              ) : null}
              <div className="mt-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-label text-maroon">
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

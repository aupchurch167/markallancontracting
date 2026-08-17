'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ProjectSummary } from '@/lib/projects';

/**
 * Editorial project grid with a client-side, single-select filter bar. Filter
 * options are the distinct categories present in the data, so they always match
 * real projects. Rectangular chips (2px radius); active = ink fill.
 */
export function ProjectsGrid({ projects }: { projects: ProjectSummary[] }) {
  const [filter, setFilter] = useState('All');

  const categories = useMemo(() => {
    const set: string[] = [];
    for (const p of projects) if (p.category && !set.includes(p.category)) set.push(p.category);
    return ['All', ...set];
  }, [projects]);

  const shown = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="container-page">
      {/* Filter bar */}
      {categories.length > 1 && (
        <div className="mb-10 flex flex-wrap gap-2.5 border-t border-hairline pt-6">
          {categories.map((c) => {
            const active = c === filter;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`rounded-[2px] border px-[18px] py-2.5 text-[14px] font-semibold transition-colors ${
                  active ? 'border-ink bg-ink text-paper' : 'border-hairline text-body hover:border-maroon hover:text-maroon'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {shown.length > 0 ? (
        <div className="grid gap-7 pb-20 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`} className="group flex flex-col">
              <div className="relative h-[260px] overflow-hidden bg-paper-alt">
                {p.imageUrl && <Image src={p.imageUrl} alt={p.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />}
                {p.category && (
                  <span className="absolute left-0 top-0 bg-paper px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-maroon">
                    {p.category}
                  </span>
                )}
              </div>
              <div className="mb-1.5 mt-4 text-[17px] font-semibold leading-snug text-ink transition-colors group-hover:text-maroon">{p.title}</div>
              {p.scopeSummary && <div className="mb-2.5 text-[14px] leading-relaxed text-muted">{p.scopeSummary}</div>}
              {(p.location || p.clientType) && (
                <div className="mt-auto text-[13px] tracking-[0.04em] text-faint">{p.location || p.clientType}</div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="pb-20 text-[15px] text-muted">No projects in this category yet.</div>
      )}
    </div>
  );
}

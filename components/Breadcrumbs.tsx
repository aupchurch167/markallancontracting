import Link from 'next/link';
import { JsonLd } from './JsonLd';
import { breadcrumbSchema } from '@/lib/schema';

/** Visible breadcrumb + BreadcrumbList schema for nested routes. */
export function Breadcrumbs({ crumbs }: { crumbs: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="border-b border-stone-200 bg-stone-50">
        <div className="container-page py-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-stone-400">
            {crumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>/</span>}
                {i < crumbs.length - 1 ? (
                  <Link href={c.path} className="hover:text-accent">
                    {c.name}
                  </Link>
                ) : (
                  <span className="text-stone-600">{c.name}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
      <JsonLd data={breadcrumbSchema(crumbs)} />
    </>
  );
}

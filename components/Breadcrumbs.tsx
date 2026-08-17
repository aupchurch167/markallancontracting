import Link from 'next/link';
import { JsonLd } from './JsonLd';
import { breadcrumbSchema } from '@/lib/schema';

/** Visible breadcrumb + BreadcrumbList schema for nested routes. */
export function Breadcrumbs({ crumbs }: { crumbs: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="border-b border-hairline bg-paper">
        <div className="container-page py-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-faint">
            {crumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>/</span>}
                {i < crumbs.length - 1 ? (
                  <Link href={c.path} className="hover:text-maroon">
                    {c.name}
                  </Link>
                ) : (
                  <span className="text-body">{c.name}</span>
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

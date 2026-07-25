import Link from 'next/link';
import { SITE, CONTACT } from '@/lib/constants';
import { SERVICES, MARKETS, SERVICE_LINES } from '@/lib/site-data';
import { PhoneLink } from './PhoneLink';
import type { SiteSettings } from '@/lib/types';

/**
 * NAP rendered sitewide from a single source. Values fall back to tokens until
 * the Sanity sitewideSettings singleton is populated to match GBP exactly.
 * Company background ("About") lives in /how-we-build + here — no About page.
 */
export function Footer({
  phone,
  phoneRaw,
  email,
  settings,
}: {
  phone: string;
  phoneRaw: string;
  email: string;
  settings: SiteSettings | null;
}) {
  const addr = settings;
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* NAP */}
        <div className="lg:col-span-1">
          <div className="text-lg font-bold text-navy">{SITE.name}</div>
          <p className="mt-2 text-sm text-stone-600">{SITE.tagline}</p>
          <address className="mt-4 space-y-1 text-sm not-italic text-stone-600">
            <div>{addr?.addressStreet || CONTACT.address.street}</div>
            <div>
              {(addr?.addressCity || CONTACT.address.city) +
                ', ' +
                (addr?.addressState || CONTACT.address.state) +
                ' ' +
                (addr?.addressZip || CONTACT.address.zip)}
            </div>
            <div className="pt-2">
              <PhoneLink
                phone={phone}
                phoneRaw={phoneRaw}
                className="font-semibold text-navy hover:text-accent"
              />
            </div>
            <div>
              <a href={`mailto:${email}`} className="hover:text-accent">
                {email}
              </a>
            </div>
          </address>
        </div>

        {/* Services (lines) */}
        <div>
          <div className="text-sm font-semibold uppercase tracking-wider text-stone-400">
            Services
          </div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            {SERVICE_LINES.map((l) => (
              <li key={l.slug}>
                <Link href={l.href} className="hover:text-accent">
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Project Types */}
        <div>
          <div className="text-sm font-semibold uppercase tracking-wider text-stone-400">
            Project Types
          </div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/project-types/${s.slug}`} className="hover:text-accent">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Who We Work For */}
        <div>
          <div className="text-sm font-semibold uppercase tracking-wider text-stone-400">
            Who We Work For
          </div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            {MARKETS.map((m) => (
              <li key={m.slug}>
                <Link href={`/markets/${m.slug}`} className="hover:text-accent">
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Secondary company links */}
      <div className="border-t border-stone-200">
        <div className="container-page flex flex-wrap gap-x-6 gap-y-2 py-4 text-sm text-stone-600">
          <Link href="/how-we-build" className="hover:text-accent">How We Build</Link>
          <Link href="/construction-process" className="hover:text-accent">Our Process</Link>
          <Link href="/team" className="hover:text-accent">Team</Link>
          <Link href="/projects" className="hover:text-accent">Projects</Link>
          <Link href="/insights" className="hover:text-accent">Insights</Link>
          <Link href="/contact" className="hover:text-accent">Contact</Link>
        </div>
      </div>

      <div className="border-t border-stone-200">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-6 text-xs text-stone-400 sm:flex-row sm:items-center">
          <div>
            © {SITE.established}–present {SITE.name}. Commercial general contractor
            serving {SITE.statesServed.join(', ')}.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-accent">Privacy</Link>
            <Link href="/terms" className="hover:text-accent">Terms</Link>
            <span>Projects from {SITE.projectRange}.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

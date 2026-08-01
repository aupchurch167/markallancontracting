import Link from 'next/link';
import { SITE, CONTACT } from '@/lib/constants';
import { SERVICES, MARKETS, SERVICE_LINES } from '@/lib/site-data';
import { PhoneLink } from './PhoneLink';
import type { SiteSettings } from '@/lib/types';

/**
 * NAP rendered sitewide from a single source. Full-bleed oxblood band; bone text,
 * brass small-caps labels, brass hairlines.
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
    <footer className="bg-oxblood text-bone">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {/* NAP */}
        <div className="lg:col-span-1">
          <div className="text-lg font-bold uppercase tracking-wordmark text-bone">{SITE.name}</div>
          <p className="mt-3 text-sm text-bone/60">{SITE.tagline}</p>
          <address className="mt-6 space-y-1 text-sm not-italic text-bone/60">
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
                className="font-bold text-bone hover:text-brass"
              />
            </div>
            <div>
              <a href={`mailto:${email}`} className="hover:text-brass">
                {email}
              </a>
            </div>
          </address>
        </div>

        {/* Services (lines) */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-label text-brass">
            Services
          </div>
          <ul className="mt-4 space-y-2 text-sm text-bone/60">
            {SERVICE_LINES.map((l) => (
              <li key={l.slug}>
                <Link href={l.href} className="hover:text-brass">
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Project Types */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-label text-brass">
            Project Types
          </div>
          <ul className="mt-4 space-y-2 text-sm text-bone/60">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/project-types/${s.slug}`} className="hover:text-brass">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Who We Work For */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-label text-brass">
            Who We Work For
          </div>
          <ul className="mt-4 space-y-2 text-sm text-bone/60">
            {MARKETS.map((m) => (
              <li key={m.slug}>
                <Link href={`/markets/${m.slug}`} className="hover:text-brass">
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Secondary company links */}
      <div className="border-t-2 border-brass/40">
        <div className="container-page flex flex-wrap gap-x-6 gap-y-2 py-4 text-[11px] font-medium uppercase tracking-label text-bone/60">
          <Link href="/how-we-build" className="hover:text-brass">How We Build</Link>
          <Link href="/construction-process" className="hover:text-brass">Our Process</Link>
          <Link href="/team" className="hover:text-brass">Team</Link>
          <Link href="/projects" className="hover:text-brass">Projects</Link>
          <Link href="/insights" className="hover:text-brass">Insights</Link>
          <Link href="/contact" className="hover:text-brass">Contact</Link>
        </div>
      </div>

      <div className="border-t-2 border-brass/40">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-6 text-xs text-bone/45 sm:flex-row sm:items-center">
          <div>
            © {SITE.established}–present {SITE.name}. Commercial general contractor
            serving {SITE.statesServed.join(', ')}.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-brass">Privacy</Link>
            <Link href="/terms" className="hover:text-brass">Terms</Link>
            <span>Projects from {SITE.projectRange}.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

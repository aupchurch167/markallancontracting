import Link from 'next/link';
import { SITE, CONTACT } from '@/lib/constants';
import { SERVICES, MARKETS, SERVICE_LINES } from '@/lib/site-data';
import { PhoneLink } from './PhoneLink';
import type { SiteSettings } from '@/lib/types';

/**
 * Jobsite Editorial footer: ink-deep ground, four columns, faint small-caps
 * labels, cream-muted links. NAP rendered sitewide from a single source.
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
  const linkCls = 'text-cream-muted transition-colors hover:text-cream';
  const label = 'text-[13px] font-semibold uppercase tracking-label text-faint';

  return (
    <footer className="bg-ink-deep text-cream-muted">
      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* NAP */}
        <div>
          <div className="flex items-baseline gap-2 font-display text-xl uppercase tracking-wordmark">
            <span className="font-bold text-cream">Mark Allan</span>
            <span className="font-medium text-faint">Contracting</span>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed">Commercial general contractor. Metro Atlanta since {SITE.established}.</p>
          <address className="mt-5 space-y-1 text-[15px] not-italic leading-relaxed">
            <div>{addr?.addressStreet || CONTACT.address.street}</div>
            <div>
              {(addr?.addressCity || CONTACT.address.city) + ', ' + (addr?.addressState || CONTACT.address.state) + ' ' + (addr?.addressZip || CONTACT.address.zip)}
            </div>
            <div className="pt-2">
              <PhoneLink phone={phone} phoneRaw={phoneRaw} className="font-semibold text-cream hover:text-rose" />
            </div>
            <div>
              <a href={`mailto:${email}`} className="text-cream hover:text-rose">
                {email}
              </a>
            </div>
          </address>
        </div>

        {/* Services */}
        <div>
          <div className={label}>Services</div>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {SERVICE_LINES.map((l) => (
              <li key={l.slug}>
                <Link href={l.href} className={linkCls}>
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Project Types */}
        <div>
          <div className={label}>Project Types</div>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/project-types/${s.slug}`} className={linkCls}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Who We Work For */}
        <div>
          <div className={label}>Who We Work For</div>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {MARKETS.map((m) => (
              <li key={m.slug}>
                <Link href={`/markets/${m.slug}`} className={linkCls}>
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-6 text-[14px] text-faint sm:flex-row sm:items-center">
          <div>
            © {SITE.established}–present {SITE.name}. Commercial general contractor serving {SITE.statesServed.join(', ')}.
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-cream">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-cream">
              Terms
            </Link>
            <span>Projects from {SITE.projectRange}.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

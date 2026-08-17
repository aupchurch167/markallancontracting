'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV } from '@/lib/site-data';
import { CONTACT, telHref } from '@/lib/constants';

/**
 * Jobsite Editorial header: sticky, translucent paper + blur, bottom hairline.
 * Wordmark left, flat nav + maroon phone button right. Mobile → full-screen
 * ink overlay with condensed uppercase rows.
 */
export function Header({ phone, phoneRaw }: { phone: string; phoneRaw: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href + '/')) || pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-paper/95 backdrop-blur-md">
      <div className="container-page flex h-[68px] items-center justify-between gap-4">
        {/* Wordmark */}
        <Link href="/" className="flex items-baseline gap-2 font-display text-[21px] uppercase tracking-wordmark text-ink">
          <span className="font-bold">Mark Allan</span>
          <span className="font-medium text-faint">Contracting</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => {
            const active = isActive(item.href ?? '#');
            return (
              <Link
                key={item.label}
                href={item.href ?? '#'}
                className={`text-[15px] font-medium transition-colors ${
                  active ? 'border-b-2 border-maroon pb-0.5 text-maroon' : 'text-body hover:text-maroon'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <a href={telHref(phoneRaw)} data-tracked-phone className="rounded-[2px] bg-maroon px-5 py-2.5 text-[15px] font-semibold text-paper transition-colors hover:bg-maroon-dark">
            {phone}
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          className="flex flex-col gap-[5px] p-1.5 lg:hidden"
          onClick={() => setOpen(true)}
        >
          <span className="h-0.5 w-[22px] bg-ink" />
          <span className="h-0.5 w-[22px] bg-ink" />
          <span className="h-0.5 w-[14px] bg-ink" />
        </button>
      </div>

      {/* Mobile full-screen menu */}
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-ink text-cream lg:hidden">
          <div className="flex items-center justify-between border-b border-cream/10 px-5 py-4">
            <span className="font-display text-[17px] uppercase tracking-wordmark">
              <span className="font-bold text-cream">Mark Allan</span> <span className="font-medium text-faint">Contracting</span>
            </span>
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="relative h-6 w-6">
              <span className="absolute left-0 top-1/2 h-0.5 w-6 rotate-45 bg-cream" />
              <span className="absolute left-0 top-1/2 h-0.5 w-6 -rotate-45 bg-cream" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col px-5 py-6">
            <Link href="/" onClick={() => setOpen(false)} className="border-b border-cream/10 py-2.5 font-display text-[40px] font-bold uppercase text-cream">
              Home
            </Link>
            {NAV.map((item, i) => (
              <Link
                key={item.label}
                href={item.href ?? '#'}
                onClick={() => setOpen(false)}
                className={`py-2.5 font-display text-[40px] font-bold uppercase text-cream ${i < NAV.length - 1 ? 'border-b border-cream/10' : ''}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-auto flex flex-col gap-3 pt-8">
              <a href={telHref(phoneRaw)} data-tracked-phone className="rounded-[2px] bg-maroon py-4 text-center text-base font-semibold text-paper">
                Call {phone}
              </a>
              <div className="text-center text-[13px] text-faint">
                {CONTACT.address.street} · {CONTACT.address.city}, {CONTACT.address.state} {CONTACT.address.zip}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

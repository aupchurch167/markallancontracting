'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NAV } from '@/lib/site-data';
import { SITE } from '@/lib/constants';
import { CallButton } from './PhoneLink';

export function Header({ phone, phoneRaw }: { phone: string; phoneRaw: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-brass/50 bg-oxblood text-bone">
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
        {/* Wordmark */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="whitespace-nowrap text-base font-bold uppercase tracking-wordmark text-bone sm:text-lg">
            {SITE.name}
          </span>
          <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-label text-brass sm:block">
            Established {SITE.established}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={item.href ?? '#'}
                  className="flex items-center gap-1 px-3 py-2 text-[11px] font-medium uppercase tracking-label text-bone/70 transition-colors hover:text-brass"
                >
                  {item.label}
                  <span aria-hidden className="text-brass/70">
                    ▾
                  </span>
                </Link>
                {openMenu === item.label && (
                  <div className="absolute left-0 top-full w-64 border-2 border-brass/50 bg-bone p-2">
                    {item.children.map((child) =>
                      child.heading ? (
                        <div
                          key={child.label}
                          className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-label text-brass"
                        >
                          {child.label}
                        </div>
                      ) : (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-2 text-sm text-oxblood transition-colors hover:bg-bone-light hover:text-brass"
                        >
                          {child.label}
                        </Link>
                      ),
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href ?? '#'}
                className="px-3 py-2 text-[11px] font-medium uppercase tracking-label text-bone/70 transition-colors hover:text-brass"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Persistent phone CTA — not a nav item */}
        <div className="flex items-center gap-3">
          <CallButton
            phone={phone}
            phoneRaw={phoneRaw}
            className="btn-call-ondark hidden whitespace-nowrap px-4 py-2 text-xs sm:inline-flex"
          />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="text-bone lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav id="mobile-nav" className="border-t-2 border-brass/50 bg-oxblood lg:hidden">
          <div className="container-page space-y-1 py-4">
            {NAV.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href ?? '#'}
                  className="block py-2 text-sm font-bold uppercase tracking-heading text-bone"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-3 space-y-1 border-l-2 border-brass/40 pl-3">
                    {item.children
                      .filter((c) => !c.heading)
                      .map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-1.5 text-sm text-bone/60 hover:text-brass"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3">
              <CallButton phone={phone} phoneRaw={phoneRaw} className="btn-call-ondark w-full" />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

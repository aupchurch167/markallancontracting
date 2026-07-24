'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NAV } from '@/lib/site-data';
import { SITE } from '@/lib/constants';
import { CallButton, PhoneLink } from './PhoneLink';

export function Header({ phone, phoneRaw }: { phone: string; phoneRaw: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-paper/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
        {/* Wordmark */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-lg font-bold text-navy sm:text-xl">
            {SITE.name}
          </span>
          <span className="hidden text-xs font-medium uppercase tracking-wide text-stone-400 sm:block">
            Est. {SITE.established}
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
                  className="flex items-center gap-1 rounded px-3 py-2 text-sm font-medium text-ink hover:text-accent"
                >
                  {item.label}
                  <span aria-hidden className="text-stone-400">
                    ▾
                  </span>
                </Link>
                {openMenu === item.label && (
                  <div className="absolute left-0 top-full w-64 rounded-md border border-stone-200 bg-paper p-2 shadow-lg">
                    {item.children.map((child) =>
                      child.heading ? (
                        <div
                          key={child.label}
                          className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-stone-400"
                        >
                          {child.label}
                        </div>
                      ) : (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded px-3 py-2 text-sm text-ink hover:bg-stone-50 hover:text-accent"
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
                className="rounded px-3 py-2 text-sm font-medium text-ink hover:text-accent"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Persistent phone CTA — not a nav item */}
        <div className="flex items-center gap-3">
          <PhoneLink
            phone={phone}
            phoneRaw={phoneRaw}
            className="hidden text-sm font-semibold text-navy hover:text-accent md:inline lg:hidden xl:inline"
          />
          <CallButton
            phone={phone}
            phoneRaw={phoneRaw}
            className="btn-call hidden px-4 py-2 text-sm sm:inline-flex"
          />
          <button
            type="button"
            aria-label="Toggle menu"
            className="lg:hidden"
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
        <nav className="border-t border-stone-200 bg-paper lg:hidden">
          <div className="container-page space-y-1 py-4">
            {NAV.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href ?? '#'}
                  className="block py-2 text-base font-semibold text-navy"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-3 space-y-1 border-l border-stone-200 pl-3">
                    {item.children
                      .filter((c) => !c.heading)
                      .map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-1.5 text-sm text-stone-600"
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
              <CallButton phone={phone} phoneRaw={phoneRaw} className="btn-call w-full" />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

'use client';

import { useState } from 'react';
import {
  PhoneCall,
  EnvelopeSimple,
  Globe,
  FileText,
  CalendarCheck,
  Buildings,
  LinkSimple,
  ArrowRight,
  ArrowUpRight,
  DownloadSimple,
  InstagramLogo,
  LinkedinLogo,
  FacebookLogo,
  Check,
  type Icon,
} from '@phosphor-icons/react';

const ICONS: Record<string, Icon> = {
  phone: PhoneCall,
  envelope: EnvelopeSimple,
  globe: Globe,
  'file-text': FileText,
  'calendar-check': CalendarCheck,
  buildings: Buildings,
  link: LinkSimple,
  instagram: InstagramLogo,
  linkedin: LinkedinLogo,
  facebook: FacebookLogo,
};

const FORM_INPUT =
  'mt-1.5 w-full rounded-lg border border-brass/40 bg-bone px-3.5 py-2.5 text-oxblood placeholder:text-oxblood/40 focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/30';

export interface PublicButton {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: string;
  primary?: boolean;
}

function trackClick(id: string) {
  try {
    const body = JSON.stringify({ id });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/links/click', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/links/click', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } });
    }
  } catch {
    /* never block navigation on analytics */
  }
}

export function LinkButtons({ buttons }: { buttons: PublicButton[] }) {
  return (
    <div className="flex flex-col gap-3">
      {buttons.map((b, i) => {
        const primary = b.primary ?? i === 0;
        const IconCmp = ICONS[b.icon] || LinkSimple;
        const external = /^https?:/.test(b.href);
        const Trailing = primary ? ArrowRight : b.icon === 'file-text' ? DownloadSimple : ArrowUpRight;
        return (
          <a
            key={b.id}
            href={b.href}
            onClick={() => trackClick(b.id)}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            className={
              primary
                ? 'group flex min-h-[64px] items-center gap-4 rounded-2xl bg-oxblood px-6 py-4 text-bone shadow-md transition-all hover:bg-brass hover:text-oxblood hover:shadow-lg'
                : 'group flex min-h-[64px] items-center gap-4 rounded-2xl border border-brass/70 bg-bone-light px-6 py-4 text-oxblood shadow-md ring-1 ring-oxblood/5 transition-all hover:border-brass hover:bg-brass/5 hover:shadow-lg'
            }
          >
            <IconCmp
              size={22}
              weight="regular"
              className={primary ? 'text-bone group-hover:text-oxblood' : 'text-brass'}
            />
            <span className="flex flex-1 flex-col">
              <span className="text-[15px] font-bold uppercase tracking-heading">{b.label}</span>
              {b.sublabel && (
                <span className={`mt-0.5 text-xs ${primary ? 'text-bone/70 group-hover:text-oxblood/70' : 'text-oxblood/55'}`}>
                  {b.sublabel}
                </span>
              )}
            </span>
            <Trailing size={18} className={primary ? 'text-bone group-hover:text-oxblood' : 'text-brass'} />
          </a>
        );
      })}
    </div>
  );
}

export interface PublicSocial {
  label: string;
  href: string;
  icon: string;
}

export function SocialRow({ socials, shareUrl }: { socials: PublicSocial[]; shareUrl: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* non-secure context — no-op */
    }
  }
  const tile =
    'flex h-12 w-12 items-center justify-center rounded-xl border border-brass/70 bg-bone-light text-oxblood shadow-md ring-1 ring-oxblood/5 transition-all hover:border-brass hover:text-brass hover:shadow-lg';
  return (
    <div className="flex justify-center gap-3">
      {socials
        .filter((s) => s.href)
        .map((s) => {
          const IconCmp = ICONS[s.icon] || Globe;
          return (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className={tile}>
              <IconCmp size={20} />
            </a>
          );
        })}
      <button type="button" onClick={copy} aria-label="Copy link to this page" className={tile}>
        {copied ? <Check size={20} className="text-brass" /> : <LinkSimple size={20} />}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Link copied' : ''}
      </span>
    </div>
  );
}

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState('submitting');
    try {
      const res = await fetch('/api/links/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          phone: fd.get('phone'),
          projectType: fd.get('type'),
          notes: fd.get('notes'),
          company: fd.get('company'), // honeypot
        }),
      });
      if (!res.ok) throw new Error();
      setState('sent');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-brass/50 bg-brass/10 px-4 py-3 text-sm text-oxblood">
        <Check size={20} className="text-brass" />
        <span>Thanks — we&apos;ll be in touch today or tomorrow.</span>
      </div>
    );
  }

  const Label = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[10px] font-medium uppercase tracking-label text-brass">{children}</span>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <Label>Name</Label>
          <input name="name" type="text" required className={FORM_INPUT} />
        </label>
        <label className="block">
          <Label>Phone</Label>
          <input name="phone" type="tel" required className={FORM_INPUT} />
        </label>
      </div>
      <label className="block">
        <Label>Project type</Label>
        <input name="type" type="text" placeholder="Restaurant, retail, office, warehouse…" className={FORM_INPUT} />
      </label>
      <label className="block">
        <Label>What needs doing</Label>
        <textarea name="notes" rows={3} placeholder="Address, square footage, target open date" className={FORM_INPUT} />
      </label>
      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
      {state === 'error' && (
        <p className="text-sm text-oxblood/70">Something went wrong. Please call (404) 724-8709 and we&apos;ll take it from there.</p>
      )}
      <button type="submit" disabled={state === 'submitting'} className="btn-call w-full rounded-xl disabled:opacity-60">
        {state === 'submitting' ? 'Sending…' : 'Send it over'}
      </button>
    </form>
  );
}

export function SignupForm() {
  const [state, setState] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState('submitting');
    try {
      const res = await fetch('/api/links/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fd.get('email'), company: fd.get('company') }),
      });
      if (!res.ok) throw new Error();
      setState('sent');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="flex items-center gap-2 text-sm text-oxblood">
        <Check size={18} className="text-brass" />
        You&apos;re on the list.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-3">
      <input
        name="email"
        type="email"
        placeholder="you@company.com"
        required
        className="min-w-[200px] flex-1 rounded-lg border border-brass/40 bg-bone px-3.5 py-2.5 text-oxblood placeholder:text-oxblood/40 focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/30"
      />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
      <button type="submit" disabled={state === 'submitting'} className="btn-ghost rounded-lg disabled:opacity-60">
        {state === 'submitting' ? '…' : 'Subscribe'}
      </button>
      {state === 'error' && <p className="w-full text-sm text-oxblood/70">Could not subscribe — try again.</p>}
    </form>
  );
}

'use client';

import { useState, type ReactNode } from 'react';
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
  CheckCircle,
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
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
            className={`nl-link${primary ? ' nl-link--primary' : ''}`}
          >
            <IconCmp size={20} color="var(--color-accent-300)" weight="regular" />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <span style={{ fontWeight: 500, fontSize: 15.5 }}>{b.label}</span>
              {b.sublabel && (
                <span style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}>{b.sublabel}</span>
              )}
            </span>
            <Trailing size={16} color={primary ? 'var(--color-accent-300)' : 'var(--color-neutral-500)'} />
          </a>
        );
      })}
    </section>
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
  return (
    <section style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
      {socials
        .filter((s) => s.href)
        .map((s) => {
          const IconCmp = ICONS[s.icon] || Globe;
          return (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="nl-tile">
              <IconCmp size={19} />
            </a>
          );
        })}
      <button type="button" onClick={copy} aria-label="Copy link to this page" className="nl-tile">
        {copied ? <Check size={19} color="var(--color-accent-300)" /> : <LinkSimple size={19} />}
      </button>
      <span aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {copied ? 'Link copied' : ''}
      </span>
    </section>
  );
}

function Confirmation({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 16px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-accent-700)',
        background: 'rgba(145,132,217,.1)',
        fontSize: 14,
      }}
    >
      <CheckCircle size={20} color="var(--color-accent-300)" />
      <span>{children}</span>
    </div>
  );
}

const labelStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
  fontSize: 12.5,
  color: 'var(--color-neutral-400)',
};

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
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
    return <Confirmation>Thanks — we&apos;ll be in touch today or tomorrow.</Confirmation>;
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <label className="field" style={labelStyle}>
        Name
        <input className="nl-input" name="name" type="text" placeholder="Your name" required />
      </label>
      <label className="field" style={labelStyle}>
        Phone
        <input className="nl-input" name="phone" type="tel" placeholder="404-000-0000" required />
      </label>
      <label className="field" style={{ ...labelStyle, gridColumn: '1 / -1' }}>
        Project type
        <input className="nl-input" name="type" type="text" placeholder="Restaurant, retail, office, warehouse…" />
      </label>
      <label className="field" style={{ ...labelStyle, gridColumn: '1 / -1' }}>
        What needs doing
        <textarea className="nl-input" name="notes" rows={3} placeholder="Address, square footage, target open date" />
      </label>
      {/* Honeypot — hidden from humans, catches bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />
      {state === 'error' && (
        <div style={{ gridColumn: '1 / -1', fontSize: 13, color: '#f0a6a6' }}>
          Something went wrong. Please call 404-724-8709 and we&apos;ll take it from there.
        </div>
      )}
      <button className="nl-btn nl-btn--primary" type="submit" disabled={state === 'submitting'} style={{ gridColumn: '1 / -1' }}>
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
      <div style={{ fontSize: 14, color: 'var(--color-accent-300)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <CheckCircle size={18} />
        You&apos;re on the list.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input className="nl-input" name="email" type="email" placeholder="you@company.com" required style={{ flex: 1, minWidth: 200 }} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      <button className="nl-btn nl-btn--secondary" type="submit" disabled={state === 'submitting'}>
        {state === 'submitting' ? '…' : 'Subscribe'}
      </button>
      {state === 'error' && <div style={{ width: '100%', fontSize: 13, color: '#f0a6a6' }}>Could not subscribe — try again.</div>}
    </form>
  );
}

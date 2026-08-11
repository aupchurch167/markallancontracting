import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CalendarBlank, ArrowRight, ArrowUpRight, PhoneCall } from '@phosphor-icons/react/dist/ssr';
import { getLinksProfile, getPublicButtons, getPublicUpdates } from '@/lib/links';
import { LinkButtons, SocialRow, ContactForm, SignupForm } from './client';
import './nocturne.css';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' });

const SHARE_URL = 'https://www.macont.com/links';

export const metadata: Metadata = {
  title: 'Mark Allan Contracting — Links',
  description:
    'Call or text, book a buildout call, download the scope-of-work template, and see recent jobsite updates from Mark Allan Contracting.',
  alternates: { canonical: '/links' },
  openGraph: {
    title: 'Mark Allan Contracting',
    description: 'A family-owned general contractor. Commercial renovations and tenant buildouts across Metro Atlanta.',
    url: SHARE_URL,
  },
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default async function LinksPage() {
  const [profile, buttons, updates] = await Promise.all([
    getLinksProfile(),
    getPublicButtons(),
    getPublicUpdates(3),
  ]);
  const { sections } = profile;

  return (
    <div
      className={`nocturne ${inter.variable}`}
      style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif', paddingBottom: sections.stickyCall ? 96 : 24 }}
    >
      {/* Sticky header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '14px 20px',
          borderBottom: '1px solid var(--color-divider)',
          position: 'sticky',
          top: 0,
          zIndex: 5,
          backdropFilter: 'blur(10px)',
          background: 'rgba(20,22,32,.72)',
        }}
      >
        <a href="https://www.macont.com" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text)' }}>
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 28,
              height: 28,
              borderRadius: 6,
              border: '1px solid var(--color-accent-700)',
              color: 'var(--color-accent-300)',
              fontSize: 11,
              letterSpacing: '.06em',
            }}
          >
            MAC
          </span>
          <span style={{ fontSize: 14, letterSpacing: '.01em', fontWeight: 500 }}>Mark Allan Contracting</span>
        </a>
        <a href="https://www.macont.com" style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowUpRight size={14} /> macont.com
        </a>
      </header>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px 0', display: 'flex', flexDirection: 'column', gap: 40 }}>
        {/* Hero */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 112, height: 112 }}>
            <div
              style={{
                position: 'absolute',
                inset: -14,
                borderRadius: '50%',
                background: 'radial-gradient(circle,rgba(145,132,217,.28),rgba(145,132,217,0) 70%)',
              }}
            />
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                width={112}
                height={112}
                style={{ position: 'relative', width: 112, height: 112, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  position: 'relative',
                  width: 112,
                  height: 112,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  border: '1px solid var(--color-accent-700)',
                  color: 'var(--color-accent-300)',
                  fontSize: 30,
                  letterSpacing: '.04em',
                  background: 'var(--color-surface)',
                }}
              >
                MAC
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontWeight: 500, fontSize: 29, lineHeight: 1.15, letterSpacing: '-.01em' }}>{profile.name}</h1>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--color-accent-300)' }}>{profile.tagline}</p>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 14.5,
                lineHeight: 1.55,
                color: 'var(--color-neutral-400)',
                maxWidth: 420,
                textWrap: 'pretty',
              }}
            >
              {profile.blurb}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="nl-tag nl-tag--outline">Licensed &amp; insured</span>
            <span className="nl-tag nl-tag--accent">Metro Atlanta</span>
            {profile.since && <span className="nl-tag nl-tag--neutral">{profile.since}</span>}
          </div>
        </section>

        {/* Link buttons */}
        <LinkButtons
          buttons={buttons.map((b, i) => ({
            id: b.id,
            label: b.label,
            sublabel: b.sublabel,
            href: b.href,
            icon: b.icon,
            primary: i === 0,
          }))}
        />

        {/* Social row */}
        <SocialRow socials={profile.socials.map((s) => ({ label: s.label, href: s.href, icon: s.icon }))} shareUrl={SHARE_URL} />

        {/* Updates */}
        {sections.updates && updates.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
              <h2 style={{ margin: 0, fontWeight: 500, fontSize: 19 }}>Updates</h2>
              <span style={{ fontSize: 12.5, color: 'var(--color-neutral-500)' }}>From the jobsite</span>
            </div>
            {updates.map((u) => (
              <article
                key={u.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-neutral-800)',
                  background: 'var(--color-surface)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-neutral-500)' }}>
                  <CalendarBlank size={14} /> {fmtDate(u.postedAt)}
                </div>
                {u.imageUrl && (
                  <div className="lighten" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.imageUrl} alt="" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: 'var(--color-neutral-300)', textWrap: 'pretty' }}>
                  {u.body}
                </p>
              </article>
            ))}
            <a href="https://www.instagram.com/markallancontracting/" style={{ alignSelf: 'flex-start', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              More updates on Instagram <ArrowRight size={14} />
            </a>
          </section>
        )}

        {/* Testimonials */}
        {sections.testimonials && profile.testimonials.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ margin: 0, fontWeight: 500, fontSize: 19 }}>What owners say</h2>
            {profile.testimonials.map((t, i) => (
              <blockquote
                key={i}
                style={{
                  margin: 0,
                  padding: '16px 18px',
                  borderLeft: '2px solid var(--color-accent-600)',
                  background: 'rgba(145,132,217,.06)',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                }}
              >
                <p style={{ margin: '0 0 10px', fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-200)', textWrap: 'pretty' }}>
                  {t.quote}
                </p>
                <footer style={{ fontSize: 12.5, color: 'var(--color-neutral-500)' }}>
                  {t.name}
                  {t.role ? ` — ${t.role}` : ''}
                </footer>
              </blockquote>
            ))}
          </section>
        )}

        {/* Service-area map */}
        {sections.map && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ margin: 0, fontWeight: 500, fontSize: 19 }}>Where we work</h2>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-neutral-800)', filter: 'saturate(.55) brightness(.82)' }}>
              <iframe
                title="Metro Atlanta service area"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(profile.area.bbox)}&layer=mapnik`}
                style={{ display: 'block', width: '100%', height: 240, border: 0 }}
              />
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--color-neutral-400)' }}>{profile.area.note}</p>
          </section>
        )}

        {/* Contact form */}
        {sections.contact && (
          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              padding: 20,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-neutral-800)',
              background: 'linear-gradient(180deg,#242637,#1f2130)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h2 style={{ margin: 0, fontWeight: 500, fontSize: 19 }}>Tell us about the space</h2>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--color-neutral-400)' }}>
                A few details and we&apos;ll come back with a walkthrough time. Faster still: call 404-724-8709.
              </p>
            </div>
            <ContactForm />
          </section>
        )}

        {/* Email signup */}
        {sections.signup && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8 }}>
            <h2 style={{ margin: 0, fontWeight: 500, fontSize: 17 }}>Jobsite notes, once a month</h2>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--color-neutral-400)' }}>
              Buildout cost and permitting notes for owners and managers. No sales blasts.
            </p>
            <SignupForm />
          </section>
        )}

        {/* Footer */}
        <footer style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '24px 0 8px', borderTop: '1px solid var(--color-divider)', fontSize: 12.5, color: 'var(--color-neutral-500)' }}>
          <span>Mark Allan Contracting, Inc. — General contractor, Metro Atlanta.</span>
          <span>
            404-724-8709 · hello@macont.com · <a href="https://www.macont.com">macont.com</a>
          </span>
        </footer>
      </main>

      {/* Sticky call bar */}
      {sections.stickyCall && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 6,
            padding: '12px 20px 16px',
            background: 'linear-gradient(180deg,rgba(20,22,32,0),rgba(20,22,32,.92) 40%)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <a href="tel:4047248709" className="nl-btn nl-btn--primary" style={{ maxWidth: 520, margin: '0 auto', minHeight: 48, display: 'flex' }}>
            <PhoneCall size={18} /> Call 404-724-8709
          </a>
        </div>
      )}
    </div>
  );
}

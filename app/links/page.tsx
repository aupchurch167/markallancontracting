import type { Metadata } from 'next';
import Image from 'next/image';
import { CalendarBlank, ArrowRight, PhoneCall } from '@phosphor-icons/react/dist/ssr';
import { CONTACT, telHref } from '@/lib/constants';
import { getLinksProfile, getPublicButtons, getPublicUpdates } from '@/lib/links';
import { LinkButtons, SocialRow, ContactForm, SignupForm } from './client';

export const dynamic = 'force-dynamic';

const SHARE_URL = 'https://www.macont.com/links';

export const metadata: Metadata = {
  title: 'Links — Mark Allan Contracting',
  description:
    'Call or text, book a buildout call, download the scope-of-work template, and see recent jobsite updates from Mark Allan Contracting.',
  alternates: { canonical: '/links' },
  openGraph: {
    title: 'Mark Allan Contracting',
    description: 'A family-owned commercial general contractor. Renovations and tenant buildouts across Metro Atlanta.',
    url: SHARE_URL,
    siteName: 'Mark Allan Contracting',
    type: 'website',
    images: [{ url: '/api/og?eyebrow=Call%20%C2%B7%20Book%20%C2%B7%20Download', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mark Allan Contracting',
    description: 'Call or text, book a buildout call, and see recent jobsite updates.',
    images: ['/api/og?eyebrow=Call%20%C2%B7%20Book%20%C2%B7%20Download'],
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
  const [profile, buttons, updates] = await Promise.all([getLinksProfile(), getPublicButtons(), getPublicUpdates(3)]);
  const { sections } = profile;

  return (
    <main className="min-h-screen bg-paper pb-24">
      <div className="mx-auto flex max-w-[560px] flex-col gap-12 px-5 py-10 sm:py-14">
        {/* Hero — ink card */}
        <section className="overflow-hidden rounded-[2px] bg-ink text-cream">
          {profile.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.coverUrl} alt="" className="h-40 w-full object-cover sm:h-52" />
          )}
          <div className="flex flex-col items-center px-8 py-10 text-center">
            {profile.avatarUrl ? (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-paper p-3">
                <Image src={profile.avatarUrl} alt={profile.name} width={80} height={80} className="h-full w-full rounded-full object-contain" />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cream/40 font-display text-xl font-bold uppercase tracking-wordmark text-cream">
                MAC
              </div>
            )}
            <h1 className="mt-6 font-display text-[34px] font-bold uppercase leading-[0.95] tracking-wordmark text-cream sm:text-[40px]">
              {profile.name}
            </h1>
            <p className="mt-3 text-[12px] font-semibold uppercase tracking-label text-rose">{profile.tagline}</p>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-cream-muted">{profile.blurb}</p>
            <div className="mt-6 text-[11px] font-semibold uppercase tracking-label text-cream-muted">
              Licensed &amp; insured&nbsp;&nbsp;·&nbsp;&nbsp;Metro Atlanta{profile.since ? <>&nbsp;&nbsp;·&nbsp;&nbsp;{profile.since}</> : null}
            </div>
          </div>
        </section>

        {/* Link buttons */}
        <LinkButtons
          buttons={buttons.map((b, i) => ({ id: b.id, label: b.label, sublabel: b.sublabel, href: b.href, icon: b.icon, primary: i === 0 }))}
        />

        {/* Social row */}
        <SocialRow socials={profile.socials.map((s) => ({ label: s.label, href: s.href, icon: s.icon }))} shareUrl={SHARE_URL} />

        {/* Updates */}
        {sections.updates && updates.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-[24px] font-bold uppercase text-ink">Updates</h2>
              <span className="text-[11px] font-semibold uppercase tracking-label text-faint">From the jobsite</span>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {updates.map((u) => (
                <article key={u.id} className="border border-hairline bg-[#FFFFFF] p-5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-label text-maroon">
                    <CalendarBlank size={14} /> {fmtDate(u.postedAt)}
                  </div>
                  {u.imageUrl && (
                    <div className="mt-3 overflow-hidden border border-hairline">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.imageUrl} alt="" className="h-52 w-full object-cover" />
                    </div>
                  )}
                  <p className="mt-3 text-[15px] leading-relaxed text-body" style={{ textWrap: 'pretty' }}>
                    {u.body}
                  </p>
                </article>
              ))}
            </div>
            <a href="https://www.instagram.com/markallancontracting/" className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-label text-maroon hover:text-maroon-dark">
              More updates on Instagram <ArrowRight size={14} />
            </a>
          </section>
        )}

        {/* Testimonials */}
        {sections.testimonials && profile.testimonials.length > 0 && (
          <section>
            <h2 className="font-display text-[24px] font-bold uppercase text-ink">What owners say</h2>
            <div className="mt-5 flex flex-col gap-4">
              {profile.testimonials.map((t, i) => (
                <blockquote key={i} className="border-l-2 border-maroon bg-[#FFFFFF] py-4 pl-5 pr-5">
                  <p className="text-[17px] leading-relaxed text-ink" style={{ textWrap: 'pretty' }}>
                    “{t.quote}”
                  </p>
                  <footer className="mt-2 text-[11px] font-semibold uppercase tracking-label text-faint">
                    {t.name}
                    {t.role ? ` — ${t.role}` : ''}
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* Service-area map */}
        {sections.map && (
          <section>
            <h2 className="font-display text-[24px] font-bold uppercase text-ink">Where we work</h2>
            <div className="mt-5 overflow-hidden border border-hairline">
              <iframe
                title="Metro Atlanta service area"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(profile.area.bbox)}&layer=mapnik`}
                className="block h-60 w-full border-0"
              />
            </div>
            <p className="mt-3 text-[14px] text-muted">{profile.area.note}</p>
          </section>
        )}

        {/* Contact form */}
        {sections.contact && (
          <section className="border border-hairline bg-[#FFFFFF] p-6 sm:p-8">
            <h2 className="font-display text-[24px] font-bold uppercase text-ink">Tell us about the space</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              A few details and we&apos;ll come back with a walkthrough time. Faster still: call {CONTACT.phone}.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </section>
        )}

        {/* Email signup */}
        {sections.signup && (
          <section>
            <h2 className="font-display text-[20px] font-bold uppercase text-ink">Jobsite notes, once a month</h2>
            <p className="mt-3 text-[15px] text-muted">Buildout cost and permitting notes for owners and managers. No sales blasts.</p>
            <div className="mt-5">
              <SignupForm />
            </div>
          </section>
        )}

        {/* Contact line */}
        <p className="pt-2 text-center text-[12px] text-faint">
          <a href={telHref(CONTACT.phoneRaw)} data-tracked-phone className="hover:text-maroon">
            {CONTACT.phone}
          </a>{' '}
          ·{' '}
          <a href={`mailto:${CONTACT.email}`} className="hover:text-maroon">
            {CONTACT.email}
          </a>{' '}
          ·{' '}
          <a href="https://www.macont.com" className="hover:text-maroon">
            macont.com
          </a>
        </p>
      </div>

      {/* Sticky call bar */}
      {sections.stickyCall && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-paper/95 px-5 py-3 backdrop-blur lg:hidden">
          <a href={telHref(CONTACT.phoneRaw)} data-tracked-phone className="mx-auto flex max-w-[520px] items-center justify-center gap-2 rounded-[2px] bg-maroon py-3.5 text-[15px] font-semibold uppercase tracking-[0.04em] text-paper transition-colors hover:bg-maroon-dark">
            <PhoneCall size={18} weight="fill" /> Call {CONTACT.phone}
          </a>
        </div>
      )}
    </main>
  );
}

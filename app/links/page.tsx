import type { Metadata } from 'next';
import Image from 'next/image';
import { CalendarBlank, ArrowRight, PhoneCall } from '@phosphor-icons/react/dist/ssr';
import { CONTACT, telHref } from '@/lib/constants';
import { getLinksProfile, getPublicButtons, getPublicUpdates } from '@/lib/links';
import { Eyebrow } from '@/components/Section';
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
    <main className="min-h-screen bg-bone pb-28">
      <div className="mx-auto flex max-w-xl flex-col gap-12 px-5 py-10 sm:py-14">
        {/* Hero card */}
        <section className="rounded-3xl bg-oxblood px-8 py-10 text-center text-bone shadow-sm">
          <div className="flex flex-col items-center">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                width={100}
                height={100}
                className="rounded-full border border-bone/40 object-cover"
                style={{ height: 100, width: 100 }}
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-bone/40 text-2xl font-bold uppercase tracking-wordmark text-bone">
                MAC
              </div>
            )}
            <h1 className="mt-6 text-3xl font-bold uppercase leading-[1.15] tracking-wordmark text-bone sm:text-4xl">
              {profile.name}
            </h1>
            <p className="mt-3 text-xs font-medium uppercase tracking-label text-brass">{profile.tagline}</p>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-bone/70">{profile.blurb}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] font-medium uppercase tracking-label">
              <span className="rounded-full border border-bone/40 px-3 py-1 text-bone">Licensed &amp; insured</span>
              <span className="rounded-full bg-brass px-3 py-1 text-oxblood">Metro Atlanta</span>
              {profile.since && <span className="rounded-full border border-bone/40 px-3 py-1 text-bone">{profile.since}</span>}
            </div>
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
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold uppercase tracking-heading text-oxblood">Updates</h2>
              <Eyebrow>From the jobsite</Eyebrow>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              {updates.map((u) => (
                <article key={u.id} className="rounded-2xl border border-brass/30 bg-bone-light p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-label text-brass">
                    <CalendarBlank size={14} /> {fmtDate(u.postedAt)}
                  </div>
                  {u.imageUrl && (
                    <div className="mt-3 overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.imageUrl} alt="" className="h-56 w-full object-cover" />
                    </div>
                  )}
                  <p className="mt-3 text-[15px] leading-relaxed text-oxblood/80" style={{ textWrap: 'pretty' }}>
                    {u.body}
                  </p>
                </article>
              ))}
            </div>
            <a
              href="https://www.instagram.com/markallancontracting/"
              className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-label text-brass hover:underline"
            >
              More updates on Instagram <ArrowRight size={14} />
            </a>
          </section>
        )}

        {/* Testimonials */}
        {sections.testimonials && profile.testimonials.length > 0 && (
          <section>
            <h2 className="text-xl font-bold uppercase tracking-heading text-oxblood">What owners say</h2>
            <div className="mt-5 flex flex-col gap-4">
              {profile.testimonials.map((t, i) => (
                <blockquote key={i} className="rounded-2xl border-l-2 border-brass bg-bone-light py-4 pl-5 pr-5 shadow-sm">
                  <p className="text-lg leading-relaxed text-oxblood" style={{ textWrap: 'pretty' }}>
                    “{t.quote}”
                  </p>
                  <footer className="mt-2 text-[11px] font-medium uppercase tracking-label text-brass">
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
            <h2 className="text-xl font-bold uppercase tracking-heading text-oxblood">Where we work</h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-brass/30 shadow-sm">
              <iframe
                title="Metro Atlanta service area"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(profile.area.bbox)}&layer=mapnik`}
                className="block h-60 w-full border-0"
              />
            </div>
            <p className="mt-3 text-sm text-oxblood/60">{profile.area.note}</p>
          </section>
        )}

        {/* Contact form */}
        {sections.contact && (
          <section className="rounded-2xl border border-brass/30 bg-bone-light p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold uppercase tracking-heading text-oxblood">Tell us about the space</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-oxblood/70">
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
            <h2 className="text-lg font-bold uppercase tracking-heading text-oxblood">Jobsite notes, once a month</h2>
            <p className="mt-3 text-[15px] text-oxblood/70">
              Buildout cost and permitting notes for owners and managers. No sales blasts.
            </p>
            <div className="mt-5">
              <SignupForm />
            </div>
          </section>
        )}

        {/* Minimal contact line */}
        <p className="pt-2 text-center text-xs text-oxblood/50">
          <a href={telHref(CONTACT.phoneRaw)} data-tracked-phone className="hover:text-brass">
            {CONTACT.phone}
          </a>{' '}
          ·{' '}
          <a href={`mailto:${CONTACT.email}`} className="hover:text-brass">
            {CONTACT.email}
          </a>{' '}
          ·{' '}
          <a href="https://www.macont.com" className="hover:text-brass">
            macont.com
          </a>
        </p>
      </div>

      {/* Floating call button */}
      {sections.stickyCall && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-5">
          <a
            href={telHref(CONTACT.phoneRaw)}
            data-tracked-phone
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-oxblood px-6 py-3.5 text-sm font-bold uppercase tracking-heading text-bone shadow-lg transition-colors hover:bg-brass hover:text-oxblood"
          >
            <PhoneCall size={18} weight="fill" /> Call {CONTACT.phone}
          </a>
        </div>
      )}
    </main>
  );
}

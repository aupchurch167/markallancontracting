import type { Metadata } from 'next';
import Image from 'next/image';
import { CalendarBlank, ArrowRight } from '@phosphor-icons/react/dist/ssr';
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
    <div className="pb-20 lg:pb-0">
      {/* Hero */}
      <section className="bg-oxblood text-bone">
        <div className="container-page py-16 sm:py-20">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                width={104}
                height={104}
                className="border-2 border-bone/50 object-cover"
                style={{ height: 104, width: 104 }}
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center border-2 border-bone/50 text-2xl font-bold uppercase tracking-wordmark text-bone">
                MAC
              </div>
            )}
            <h1 className="mt-6 text-4xl font-bold uppercase leading-[1.1] tracking-wordmark text-bone sm:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-4 text-sm font-medium uppercase tracking-label text-brass">{profile.tagline}</p>
            <p className="mt-4 max-w-md text-base leading-relaxed text-bone/70">{profile.blurb}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-2 text-[11px] font-medium uppercase tracking-label">
              <span className="border border-bone/40 px-3 py-1 text-bone">Licensed &amp; insured</span>
              <span className="bg-brass px-3 py-1 text-oxblood">Metro Atlanta</span>
              {profile.since && <span className="border border-bone/40 px-3 py-1 text-bone">{profile.since}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Body column */}
      <div className="container-page">
        <div className="mx-auto flex max-w-xl flex-col gap-16 py-16">
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
                <h2 className="text-2xl font-bold uppercase tracking-heading text-oxblood">Updates</h2>
                <Eyebrow>From the jobsite</Eyebrow>
              </div>
              <hr className="rule-brass mt-4" />
              <div className="mt-6 flex flex-col gap-5">
                {updates.map((u) => (
                  <article key={u.id} className="border-2 border-brass/40 bg-bone-light p-5">
                    <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-label text-brass">
                      <CalendarBlank size={14} /> {fmtDate(u.postedAt)}
                    </div>
                    {u.imageUrl && (
                      <div className="mt-3 overflow-hidden border border-brass/30">
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
                className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-label text-brass hover:underline"
              >
                More updates on Instagram <ArrowRight size={14} />
              </a>
            </section>
          )}

          {/* Testimonials */}
          {sections.testimonials && profile.testimonials.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold uppercase tracking-heading text-oxblood">What owners say</h2>
              <hr className="rule-brass mt-4" />
              <div className="mt-6 flex flex-col gap-6">
                {profile.testimonials.map((t, i) => (
                  <blockquote key={i} className="border-l-2 border-brass pl-5">
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
              <h2 className="text-2xl font-bold uppercase tracking-heading text-oxblood">Where we work</h2>
              <hr className="rule-brass mt-4" />
              <div className="mt-6 overflow-hidden border-2 border-brass/40">
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
            <section className="border-2 border-brass/40 bg-bone-light p-6 sm:p-8">
              <h2 className="text-2xl font-bold uppercase tracking-heading text-oxblood">Tell us about the space</h2>
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
              <h2 className="text-xl font-bold uppercase tracking-heading text-oxblood">Jobsite notes, once a month</h2>
              <p className="mt-3 text-[15px] text-oxblood/70">
                Buildout cost and permitting notes for owners and managers. No sales blasts.
              </p>
              <div className="mt-5">
                <SignupForm />
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Sticky call bar (mobile only — the header already carries the call on desktop) */}
      {sections.stickyCall && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-brass bg-oxblood px-5 py-3 lg:hidden">
          <a href={telHref(CONTACT.phoneRaw)} data-tracked-phone className="btn-call-ondark mx-auto flex max-w-md">
            Call {CONTACT.phone}
          </a>
        </div>
      )}
    </div>
  );
}

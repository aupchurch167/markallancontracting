import type { Metadata } from 'next';
import { Buildings } from '@phosphor-icons/react/dist/ssr';
import { getSiteSettings } from '@/lib/queries';
import { getAboutPhotos } from '@/lib/content';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { Reveal } from '@/components/Reveal';
import { CountUp } from '@/components/CountUp';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '25+ Years, One Family | Mark Allan Contracting',
  description:
    'From a single Domino’s drive-thru window to a second-generation commercial contractor serving Metro Atlanta. The Mark Allan Contracting story.',
  path: '/about',
});

// Photos are admin-managed (Page photos), so render fresh — matches the other
// CMS-driven routes and lets edits show without a rebuild.
export const dynamic = 'force-dynamic';

const TIMELINE = [
  {
    year: '1999',
    title: 'Mark Allan Contracting',
    body: [
      'Mark went out on his own. He founded the company with a business partner, Allan Burns — put their two first names on the door and got to work. Commercial projects across Georgia and the Southeast: restaurants, retail, office space.',
      'Allan later moved on, and Mark became the sole owner. The name stayed. By then it wasn’t two guys’ first names anymore. It was a reputation.',
    ],
  },
  {
    year: '2006',
    title: 'The second generation shows up',
    body: [
      'Mark’s son Justin joined straight out of high school. As a laborer. No title, no shortcut. He carried material, then learned carpentry, then ran crews as a superintendent, then ran whole projects as a project manager.',
      'Today he’s President and lead PM — and when you get an estimate from us, Justin is the one who built it and the one who answers when you call. Nearly twenty years on our jobsites will do that.',
    ],
  },
  {
    year: '2020',
    title: 'Revenue cut to a fifth',
    body: [
      'Heading into 2020 the work was steady — film-industry projects and restaurant buildouts. Then the pandemic hit and both went to zero. Almost overnight, revenue fell to a fifth of what it had been.',
      'We didn’t lay the company down. We took the same crews and the same standards and went residential — people were investing in their homes while storefronts sat dark. It kept our people working and the doors open. Some of our best reviews still come from those years.',
    ],
  },
  {
    year: '2022',
    title: 'Adam comes back',
    body: [
      'Mark’s other son, Adam, came in out of college and saw the business differently — less from the field, more from where the work comes from. He left to test that instinct: sales and marketing with companies like Marketo and Adobe, then a real estate business and an assisted-living business of his own.',
      'In 2022 he came back full time to run growth and business development. Working together wasn’t an accident. It was the plan the whole time.',
    ],
  },
  {
    year: '2025',
    title: 'The road back — past $5 million',
    body: [
      'Since bottoming out at $500K in 2020, we’ve grown 40–60% every year — past $5 million in 2025, and on pace to match it in 2026 in a year that’s been hard on a lot of our customers.',
      'That growth came from going back to what we know best: commercial work. Tenant improvements, restaurant and retail buildouts, office renovations, warehouse conversions — $50K to $500K across Georgia, Tennessee, Alabama and South Carolina, including recent work for national brands like Olive Garden.',
    ],
  },
];

const BUYS = [
  {
    title: 'Two decades on the tools',
    body: 'The person estimating your project has run jobsites for twenty years. He knows what a wall actually costs to move.',
  },
  {
    title: 'A name on the building',
    body: 'The person answering the phone has a last name that’s on the door. You’re not routed to a call center — Justin picks up.',
  },
  {
    title: 'Franchise-grade standards',
    body: 'The standards came from a founder who learned the trade building for a national franchise that measured every store against the last one.',
  },
];

/**
 * A managed About-page photo. Renders the uploaded image when set, otherwise a
 * branded placeholder captioned with the intended shot (admin: Page photos).
 */
function AboutImage({ photo, caption }: { photo: { url: string; alt: string }; caption: string }) {
  if (photo.url) {
    return (
      <figure className="overflow-hidden rounded-[2px] border border-hairline bg-paper-alt">
        <div className="aspect-[16/10] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={photo.alt || caption} className="h-full w-full object-cover" />
        </div>
      </figure>
    );
  }
  return (
    <figure className="overflow-hidden rounded-[2px] border border-hairline bg-paper-alt">
      <div className="flex aspect-[16/10] flex-col items-center justify-center gap-3 text-maroon/70">
        <Buildings size={40} weight="light" />
        <span className="text-[10px] font-medium uppercase tracking-label text-maroon/70">Photo</span>
      </div>
      <figcaption className="border-t border-hairline px-4 py-2.5 text-xs text-muted">{caption}</figcaption>
    </figure>
  );
}

export default async function AboutPage() {
  const [{ phone, phoneRaw }, photos] = await Promise.all([getSiteSettings(), getAboutPhotos()]);

  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-cream">
        <div className="container-page py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-[10px] font-medium uppercase tracking-label text-maroon">Our story · Since 1999</div>
            <h1 className="mt-6 text-4xl font-bold uppercase leading-[1.1] tracking-wordmark text-cream sm:text-5xl lg:text-6xl">
              25+ Years,
              <br className="hidden sm:block" /> One Family
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-cream-muted sm:text-xl">
              From a single Domino’s drive-thru window to a second-generation commercial contractor serving Metro
              Atlanta.
            </p>
            <div className="mt-10 flex justify-center">
              <CallButton phone={phone} phoneRaw={phoneRaw} label="Call us" className="btn-call-ondark" />
            </div>
          </div>
        </div>
      </section>

      {/* It started with a drive-thru window */}
      <section className="py-24 sm:py-28">
        <div className="container-page">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="eyebrow">Where it began</div>
              <h2 className="mt-4 text-3xl font-bold uppercase tracking-heading text-ink sm:text-4xl">
                It started with a drive-thru window
              </h2>
              <div className="prose-copy mt-6">
                <p>Before there was a company, there was a window.</p>
                <p>
                  Early in his career, Mark Upchurch installed a single drive-thru window for a Domino’s location. The
                  work was good. The next job was bigger. Then bigger again. Working with Ganaway Contracting, Mark spent
                  years building Domino’s stores across the country — learning what it takes to deliver for a national
                  brand that expects the same result in every market, on every site, every time.
                </p>
                <p className="text-ink">
                  That’s the education this company was built on. Not theory. Repetition, standards, and showing up.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <AboutImage photo={photos.team} caption="Mark, Adam, and Justin on a current jobsite" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-paper-alt py-24 sm:py-28">
        <div className="container-page">
          <Reveal>
            <div className="eyebrow">The road so far</div>
            <h2 className="mt-4 text-3xl font-bold uppercase tracking-heading text-ink sm:text-4xl">
              Three generations of lessons
            </h2>
          </Reveal>

          <div className="mt-14 space-y-0">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.year} delay={i * 60}>
                <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10">
                  {/* Rail + year */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold tracking-wide text-cream">
                      {t.year}
                    </div>
                    {i < TIMELINE.length - 1 && <div className="my-1 w-px flex-1 bg-maroon/40" />}
                  </div>
                  {/* Content */}
                  <div className="pb-14">
                    <h3 className="text-xl font-bold uppercase tracking-heading text-ink sm:text-2xl">{t.title}</h3>
                    <div className="prose-copy mt-4">
                      {t.body.map((p, j) => (
                        <p key={j}>{p}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Then + now photos (appears once at least one is uploaded) */}
      {(photos.early.url || photos.recent.url) && (
        <section className="py-20 sm:py-24">
          <div className="container-page grid gap-6 sm:grid-cols-2">
            <Reveal>
              <AboutImage photo={photos.early} caption="An early Mark Allan project" />
            </Reveal>
            <Reveal delay={100}>
              <AboutImage photo={photos.recent} caption="Recent work — a national-brand buildout" />
            </Reveal>
          </div>
        </section>
      )}

      {/* Stats band */}
      <section className="bg-ink py-20 text-cream sm:py-24">
        <div className="container-page">
          <div className="grid gap-12 text-center sm:grid-cols-3">
            <Reveal>
              <div className="text-5xl font-bold tracking-wordmark text-cream sm:text-6xl">
                <CountUp to={25} suffix="+" />
              </div>
              <div className="mt-3 text-[11px] font-medium uppercase tracking-label text-maroon">Years, one family</div>
            </Reveal>
            <Reveal delay={100}>
              <div className="text-5xl font-bold tracking-wordmark text-cream sm:text-6xl">
                <CountUp to={10} suffix="×" />
              </div>
              <div className="mt-3 text-[11px] font-medium uppercase tracking-label text-maroon">
                Revenue growth since 2020
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="text-5xl font-bold tracking-wordmark text-cream sm:text-6xl">40–60%</div>
              <div className="mt-3 text-[11px] font-medium uppercase tracking-label text-maroon">
                Growth, every year
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What 25+ years buys you */}
      <section className="py-24 sm:py-28">
        <div className="container-page">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <div className="eyebrow">In practice</div>
              <h2 className="mt-4 text-3xl font-bold uppercase tracking-heading text-ink sm:text-4xl">
                What 25+ years actually buys you
              </h2>
              <p className="prose-copy mx-auto mt-6 text-center">
                Companies our age like to talk about legacy. Here’s what ours means on your project.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {BUYS.map((b, i) => (
              <Reveal key={b.title} delay={i * 100}>
                <div className="h-full rounded-[2px] border border-hairline bg-paper-alt p-7">
                  <div className="h-8 w-8 border-b-2 border-hairline" />
                  <h3 className="mt-5 text-lg font-bold uppercase tracking-heading text-ink">{b.title}</h3>
                  <p className="mt-3 leading-relaxed text-body">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <p className="mx-auto mt-14 max-w-2xl text-center text-2xl font-bold uppercase leading-snug tracking-heading text-ink">
              Three generations of lessons, one family, still building.
            </p>
          </Reveal>
        </div>
      </section>

      <CallCTA
        phone={phone}
        phoneRaw={phoneRaw}
        heading="Got a commercial project in Metro Atlanta or the Southeast?"
        body="Call us. Justin picks up — the same person who’ll build your estimate and run your job."
      />
    </>
  );
}

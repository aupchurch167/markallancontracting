import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings, getPosts } from '@/lib/queries';
import { FALLBACK_POSTS } from '@/lib/fallback-insights';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Ground-Up Commercial Construction in Georgia — Where We Start',
  description:
    'Shell work, owner’s-side perspective, and pre-construction strength for ground-up commercial projects in Metro Atlanta. Honest scope, no overreach.',
  path: '/new-construction',
});

/**
 * CONTENT-LIMITED. Ground-up is a growth direction, not an established portfolio.
 * Lead with what is true (25+ years, national brands, self-performed trades,
 * owner's-side perspective). Do NOT claim ground-up portfolio depth or imply
 * scale MAC hasn't delivered. The visuals below are careful to mark shell +
 * interior + pre-construction as the real strengths and the rest as coordinate/
 * partner — no overreach.
 */

const TRUE_TODAY = [
  {
    name: '25+ years',
    body: 'Est. 1999. A quarter century of commercial construction across four states.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />,
  },
  {
    name: 'National-brand clients',
    body: 'Over a hundred Domino’s buildouts, and work for Darden since.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />,
  },
  {
    name: 'Self-performed trades',
    body: 'Framing, drywall, paint, ceilings, and flooring run by our own crews.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />,
  },
  {
    name: 'Owner’s-side perspective',
    body: 'We’ve developed and operated our own commercial property, so we know what an owner carries.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />,
  },
];

// Honest ground-up positioning: strong on shell + interior + inspections,
// pre-construction across the front; coordinate/partner on entitlement + civil.
const GROUNDUP = [
  { stage: 'Entitlement', note: 'Zoning, site plan, approvals', role: 'coordinate' as const },
  { stage: 'Sitework & civil', note: 'Grading, utilities, stormwater', role: 'coordinate' as const },
  { stage: 'Shell', note: 'Structure, envelope, roof', role: 'strong' as const },
  { stage: 'Interior fit-out', note: 'Our self-performed trades', role: 'strong' as const },
  { stage: 'Inspections & CO', note: 'Punch, inspections, occupancy', role: 'strong' as const },
];

const COMPARE = [
  {
    heading: 'A national firm',
    points: [
      'Your project is a rounding error on their books',
      'Priced by one team, built by another you never met',
      'Process built for jobs ten times the size',
    ],
    fit: false,
  },
  {
    heading: 'A builder like us',
    points: [
      'The people who price it are on site building it',
      'Owner’s-side perspective — we’ve carried the risk ourselves',
      'Scoped for what actually worries an owner: the number, the schedule, the trades',
    ],
    fit: true,
  },
];

export default async function NewConstructionPage() {
  const { phone, phoneRaw } = await getSiteSettings();
  const posts = await getPosts();
  const sanityGroundUp = posts.filter((p) => p.cluster === 'ground-up');
  const sanitySlugs = new Set(sanityGroundUp.map((p) => p.slug));
  const groundUp = [
    ...sanityGroundUp,
    ...FALLBACK_POSTS.filter(
      (p) => p.cluster === 'ground-up' && !sanitySlugs.has(p.slug),
    ),
  ].slice(0, 3);

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'How We Build', path: '/how-we-build' },
          { name: 'New Construction', path: '/new-construction' },
        ]}
      />

      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Ground-up commercial
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Ground-up, from the owner&apos;s side
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            We&apos;ve spent 25 years building commercial interiors for national
            brands — and we&apos;ve been the owner developing and operating our own
            commercial property. That combination is what we bring to a ground-up
            conversation.
          </p>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} />
          </div>
        </div>
      </section>

      {/* What's true — lead with it */}
      <Section>
        <Eyebrow>What&apos;s true today</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
          The proof we lead with
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRUE_TODAY.map((item) => (
            <div key={item.name} className="rounded-lg border border-stone-200 bg-paper p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6}>
                  {item.icon}
                </svg>
              </span>
              <h3 className="mt-4 font-bold text-navy">{item.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* What we take on today — honest scope, size chip */}
      <Section muted>
        <div className="max-w-3xl">
          <Eyebrow>What we take on today</Eyebrow>
          <p className="mt-3 text-lg leading-relaxed text-stone-600">
            Our proof base is commercial interior work from {SITE.projectRange} —
            tenant improvements, restaurant and retail buildouts, office and
            warehouse conversions, self-performed across framing, drywall, paint,
            ceilings, and flooring. On the ground-up side we are strongest at shell
            work and at the pre-construction that gets a project to a real number
            before the first shovel. We will tell you plainly what fits that and what
            does not.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-navy/15 bg-paper px-4 py-2 text-sm font-semibold text-navy">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Projects from {SITE.projectRange}
          </div>
        </div>
      </Section>

      {/* Where we're strongest on a ground-up project — honest timeline */}
      <Section>
        <Eyebrow>Where we fit on a ground-up project</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
          On home ground at the shell and the fit-out
        </h2>
        <p className="mt-3 max-w-2xl text-stone-600">
          Ground-up is a growth direction for us, and we&apos;re straight about it.
          Here&apos;s where we self-perform and lead, and where we coordinate and
          partner.
        </p>

        <div className="mt-8 overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-5 gap-2">
            {GROUNDUP.map((s) => (
              <div key={s.stage} className="text-center">
                <div
                  className={`flex h-16 items-center justify-center rounded-lg px-2 text-sm font-semibold ${
                    s.role === 'strong'
                      ? 'bg-navy text-white'
                      : 'border border-dashed border-stone-300 bg-stone-50 text-stone-500'
                  }`}
                >
                  {s.stage}
                </div>
                <p className="mt-2 text-xs text-stone-500">{s.note}</p>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    s.role === 'strong' ? 'text-accent' : 'text-stone-400'
                  }`}
                >
                  {s.role === 'strong' ? '✓ We lead' : 'We coordinate'}
                </p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-5 max-w-2xl text-sm text-stone-500">
          Pre-construction runs across the front end — it&apos;s where we add the
          most before the first shovel, whatever the delivery method.
        </p>
      </Section>

      {/* Why a smaller GC — honest comparison */}
      <Section muted>
        <Eyebrow>Why a smaller GC for ground-up</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
          On a project this size, who you hire is who shows up
        </h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {COMPARE.map((col) => (
            <div
              key={col.heading}
              className={`rounded-xl border bg-paper p-7 ${
                col.fit ? 'border-accent shadow-sm ring-1 ring-accent/20' : 'border-stone-200'
              }`}
            >
              <h3 className="text-lg font-bold text-navy">{col.heading}</h3>
              <ul className="mt-4 space-y-3">
                {col.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-stone-600">
                    {col.fit ? (
                      <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-stone-300" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Pre-construction as the entry point */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Where it starts</Eyebrow>
          <p className="mt-3 text-lg leading-relaxed text-stone-600">
            The right entry point for a ground-up conversation is pre-construction —
            budgeting, feasibility, and scope development before anything is locked.
            That is where we add the most value early, and where the decisions that
            set your budget actually get made.
          </p>
          <Link
            href="/pre-construction"
            className="mt-4 inline-block font-semibold text-accent hover:text-accent-700"
          >
            See what pre-construction covers →
          </Link>
        </div>
      </Section>

      {/* Ground-up blog cluster — doing the credibility work */}
      {groundUp.length > 0 && (
        <Section muted>
          <Eyebrow>Reading for owners and developers</Eyebrow>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {groundUp.map((p) => (
              <Link
                key={p.slug}
                href={`/insights/${p.slug}`}
                className="group rounded-lg border border-stone-200 bg-paper p-6 transition-colors hover:border-accent"
              >
                <div className="text-lg font-semibold text-navy group-hover:text-accent">
                  {p.title}
                </div>
                {p.excerpt && <p className="mt-2 text-sm text-stone-600">{p.excerpt}</p>}
              </Link>
            ))}
          </div>
        </Section>
      )}

      <CallCTA
        phone={phone}
        phoneRaw={phoneRaw}
        heading="Thinking about a ground-up project?"
        body="Call us early. Pre-construction is where we can help most."
      />
    </>
  );
}

import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/queries';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Pre-Construction Services in Metro Atlanta',
  description:
    'A paid pre-construction engagement — feasibility, budgeting, value engineering, permitting strategy, and a Matterport scan. Fixed fee, credited to the build if we do it.',
  path: '/pre-construction',
});

const TIERS = [
  {
    name: 'Feasibility & Budget Check',
    tagline: 'Does this project pencil?',
    forWho: 'For owners and brokers deciding whether a deal or a project is worth chasing.',
    includes: [
      'Site walk and existing-conditions assessment',
      'Order-of-magnitude budget',
      'Feasibility read — does the building support the use',
      'A rough schedule',
      'A straight go / no-go',
    ],
    deliverable: 'A short written budget and feasibility summary.',
    flagship: false,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    name: 'Full Pre-Construction',
    tagline: 'A number and a plan you can build from.',
    forWho: 'For projects moving toward construction that need a defensible budget and a real schedule.',
    includes: [
      'Everything in the Budget Check',
      'Trade-by-trade budgeting',
      'Value engineering, with the cost of each option',
      'Full scope development a GC can bid',
      'Permitting strategy for your jurisdiction',
      'Matterport 3D scan of the space',
      'A construction-ready schedule',
    ],
    deliverable:
      'A complete pre-construction package — budget, schedule, VE options, permitting roadmap, and scan.',
    flagship: true,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
];

const DELIVERABLES = [
  {
    name: 'A scoped budget',
    body: 'Built trade by trade — not a per-foot guess — and defensible to an owner or lender.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    name: 'A realistic schedule',
    body: 'A timeline that accounts for permitting and the long-lead items that actually move a date.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  },
  {
    name: 'Value-engineering options',
    body: 'Ways to hit the same result for less — each with the cost, so the trade-off is yours to make.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />,
  },
  {
    name: 'A defined scope',
    body: 'A scope a GC can actually bid, so the numbers you compare are apples to apples.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
  },
  {
    name: 'A permitting roadmap',
    body: 'What your jurisdiction will require, mapped before you file — so review doesn’t stall the job.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  },
  {
    name: 'A Matterport scan',
    body: 'An accurate 3D model of the existing space to build against — fewer field surprises.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />,
  },
];

const STEPS = [
  {
    title: 'Scope and fee',
    body: 'We agree what the engagement covers and a fixed fee before any work starts. No open meter.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />,
  },
  {
    title: 'Walk and assess',
    body: 'We walk the space and dig into existing conditions, systems, feasibility, and the jurisdiction.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />,
  },
  {
    title: 'Budget and plan',
    body: 'We build the budget, schedule, and value-engineering options — the number and the plan behind it.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
  },
  {
    title: 'Handoff',
    body: 'You get the package and a clear decision. If we build the project, the fee credits back against construction.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
];

// Illustrative stages for the influence/cost visual.
const STAGES = ['Concept', 'Design', 'Pre-construction', 'Construction'];

export default async function PreConstructionPage() {
  const { phone, phoneRaw } = await getSiteSettings();

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'How We Build', path: '/how-we-build' },
          { name: 'Pre-Construction', path: '/pre-construction' },
        ]}
      />

      <section className="bg-ink text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-maroon">
            A pre-construction engagement
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Get the number before you commit
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream-muted">
            A defined, paid engagement that gets you a defensible budget and a real
            schedule before construction starts — and if we build the project, the
            fee comes off your construction cost.
          </p>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} />
          </div>
        </div>
      </section>

      {/* Problem */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>The problem</Eyebrow>
          <p className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">
            You&apos;re being asked for a number before anyone knows the scope.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-body">
            An owner or a lender wants a figure. The drawings are half-done, the use
            is not fully settled, and the existing conditions are a question mark.
            Guess low and you eat the change orders. Guess high and you lose the
            deal. Pre-construction is how you get to a number you can actually stand
            behind — as a defined piece of work, not a favor.
          </p>
        </div>
      </Section>

      {/* Two tiers */}
      <Section muted>
        <Eyebrow>Two ways to start</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
          Pick the depth your project needs
        </h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-[2px] border bg-paper p-7 ${
                tier.flagship ? 'border-maroon ring-1 ring-accent/20' : 'border-hairline'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-ink/5 text-ink">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.7}>
                      {tier.icon}
                    </svg>
                  </span>
                  <h3 className="text-xl font-bold text-ink">{tier.name}</h3>
                </div>
                {tier.flagship && (
                  <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Most projects
                  </span>
                )}
              </div>
              <p className="mt-3 font-medium text-maroon">{tier.tagline}</p>
              <p className="mt-2 text-sm text-body">{tier.forWho}</p>
              <ul className="mt-5 space-y-2">
                {tier.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-body">
                    <span aria-hidden className="mt-1 text-maroon">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-hairline pt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-faint">
                  You walk away with
                </div>
                <p className="mt-1 text-sm font-medium text-ink">{tier.deliverable}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* What you walk away with — deliverables */}
      <Section>
        <Eyebrow>What you walk away with</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
          Real deliverables, not a verbal estimate
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DELIVERABLES.map((d) => (
            <div key={d.name} className="rounded-[2px] border border-hairline bg-paper p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-accent/10 text-maroon">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  {d.icon}
                </svg>
              </span>
              <h3 className="mt-4 font-bold text-ink">{d.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-body">{d.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Fee model */}
      <Section muted>
        <div className="mx-auto max-w-3xl rounded-[2px] border border-navy/15 bg-paper p-8">
          <Eyebrow>How the fee works</Eyebrow>
          <p className="mt-3 text-xl font-semibold text-ink">
            A fixed fee, agreed up front. If we build the project, it comes off your
            construction cost.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-body">
            No open meter and no surprise invoice — you know the number before we
            start. You get a defensible budget and a real plan either way. And if you
            hire us for the build, the pre-construction fee is credited back against
            construction, so the work pays for itself.
          </p>
        </div>
      </Section>

      {/* How the engagement runs — flow */}
      <Section>
        <Eyebrow>How the engagement runs</Eyebrow>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-[2px] border border-hairline bg-paper p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                  {i + 1}
                </span>
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-maroon" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  {step.icon}
                </svg>
              </div>
              <h3 className="mt-3 font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-body">{step.body}</p>
              {i < STEPS.length - 1 && (
                <span aria-hidden className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-2xl text-faint lg:block">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* Why early — cost-of-change visual */}
      <Section muted>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Why bring us in early</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
              Early, your decisions are cheap. Later, they’re expensive.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-body">
              At the start of a project you can still influence the cost for almost
              nothing — it’s a redline, not a demolition. Once it’s built, the same
              change costs the most it ever will. Pre-construction is how you spend
              your influence while it’s still cheap.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-body">
              A GC in the room during budgeting catches the conditions, the code
              triggers, and the long-lead items early — while they’re redlines, not
              change orders.
            </p>
          </div>

          {/* Illustrative influence vs. cost-to-change curves */}
          <figure className="rounded-[2px] border border-hairline bg-paper p-6">
            <svg
              viewBox="0 0 480 260"
              className="h-auto w-full"
              role="img"
              aria-label="As a project moves from concept to construction, your ability to influence cost falls while the cost of making a change rises. Pre-construction is the crossover where influence is still high and change is still cheap."
            >
              {/* pre-construction highlight band */}
              <rect x="250" y="20" width="110" height="180" fill="#2E75B6" opacity="0.07" />
              {/* axes */}
              <line x1="40" y1="200" x2="450" y2="200" stroke="#DCE2E8" strokeWidth="1.5" />
              {/* influence line (accent) — high to low */}
              <path d="M45,45 C180,60 250,165 445,180" fill="none" stroke="#2E75B6" strokeWidth="3" strokeLinecap="round" />
              {/* cost-to-change line (navy) — low to high */}
              <path d="M45,180 C180,168 250,70 445,40" fill="none" stroke="#1B3A5C" strokeWidth="3" strokeLinecap="round" />
              {/* labels */}
              <text x="48" y="36" fontSize="12" fontWeight="600" fill="#2E75B6">Your influence over cost</text>
              <text x="300" y="34" fontSize="12" fontWeight="600" fill="#1B3A5C">Cost of a change</text>
              {/* stage labels */}
              {STAGES.map((s, i) => (
                <text
                  key={s}
                  x={70 + i * 120}
                  y="220"
                  fontSize="11"
                  fill="#556270"
                  textAnchor="middle"
                >
                  {s}
                </text>
              ))}
              <text x="305" y="240" fontSize="11" fontWeight="600" fill="#2E75B6" textAnchor="middle">
                the sweet spot
              </text>
            </svg>
            <figcaption className="mt-3 text-center text-xs italic text-faint">
              Illustrative — the classic reason to bring a builder in before the
              drawings are done.
            </figcaption>
          </figure>
        </div>
      </Section>

      <CallCTA
        phone={phone}
        phoneRaw={phoneRaw}
        heading="Start with a call"
        body="Tell us about the project and we'll scope a pre-construction engagement — and what it'll cost."
      />
    </>
  );
}

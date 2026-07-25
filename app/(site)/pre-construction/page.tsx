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
  },
];

const STEPS = [
  ['Scope and fee', 'We agree what the engagement covers and a fixed fee before any work starts. No open meter.'],
  ['Walk and assess', 'We walk the space and dig into existing conditions, systems, feasibility, and the jurisdiction.'],
  ['Budget and plan', 'We build the budget, schedule, and value-engineering options — the number and the plan behind it.'],
  ['Handoff', 'You get the package and a clear decision. If we build the project, the fee credits back against construction.'],
];

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

      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            A pre-construction engagement
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Get the number before you commit
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
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
          <p className="mt-3 text-2xl font-semibold text-navy sm:text-3xl">
            You&apos;re being asked for a number before anyone knows the scope.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-stone-600">
            An owner or a lender wants a figure. The drawings are half-done, the use
            is not fully settled, and the existing conditions are a question mark.
            Guess low and you eat the change orders. Guess high and you lose the
            deal. Pre-construction is how you get to a number you can actually stand
            behind — as a defined piece of work, not a favor.
          </p>
        </div>
      </Section>

      {/* Two tiers — the product */}
      <Section muted>
        <Eyebrow>Two ways to start</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
          Pick the depth your project needs
        </h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-xl border bg-paper p-7 ${
                tier.flagship ? 'border-accent shadow-sm ring-1 ring-accent/20' : 'border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-navy">{tier.name}</h3>
                {tier.flagship && (
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Most projects
                  </span>
                )}
              </div>
              <p className="mt-1 font-medium text-accent">{tier.tagline}</p>
              <p className="mt-3 text-sm text-stone-600">{tier.forWho}</p>
              <ul className="mt-5 space-y-2">
                {tier.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-stone-600">
                    <span aria-hidden className="mt-1 text-accent">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-stone-200 pt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  You walk away with
                </div>
                <p className="mt-1 text-sm font-medium text-navy">{tier.deliverable}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Fee model — the sell */}
      <Section>
        <div className="mx-auto max-w-3xl rounded-xl border border-navy/15 bg-navy/[0.03] p-8">
          <Eyebrow>How the fee works</Eyebrow>
          <p className="mt-3 text-xl font-semibold text-navy">
            A fixed fee, agreed up front. If we build the project, it comes off your
            construction cost.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            No open meter and no surprise invoice — you know the number before we
            start. You get a defensible budget and a real plan either way. And if you
            hire us for the build, the pre-construction fee is credited back against
            construction, so the work pays for itself.
          </p>
        </div>
      </Section>

      {/* How the engagement runs */}
      <Section muted>
        <Eyebrow>How the engagement runs</Eyebrow>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([title, body], i) => (
            <div key={title}>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
                {i + 1}
              </div>
              <h3 className="mt-4 text-lg font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm text-stone-600">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* When to bring us in */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>When to bring us in</Eyebrow>
          <p className="mt-3 text-lg leading-relaxed text-stone-600">
            Early. The cheapest time to change something is before it is drawn, and
            the most expensive time is after it is built. A GC in the room during
            budgeting catches the conditions, the code triggers, and the long-lead
            items while they are still cheap to solve. Waiting until the drawings are
            done means pricing decisions that were already made for you.
          </p>
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

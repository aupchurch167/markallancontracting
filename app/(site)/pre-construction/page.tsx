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
    'Budgeting, feasibility, site assessment, and value engineering before scope is locked. Get a defensible number and a realistic schedule.',
  path: '/pre-construction',
});

const COVERS = [
  ['Budgeting', 'A real number built from scope, not a per-foot guess.'],
  ['Feasibility', 'Whether the building and the use actually line up.'],
  ['Site assessment', 'What the existing conditions are going to cost you.'],
  ['Scope development', 'Turning an idea into something a GC can price.'],
  ['Value engineering', 'Where the money is, and where it does not need to be.'],
  ['Permitting strategy', 'What the jurisdiction will require, before you file.'],
  ['Matterport scanning', 'An accurate model of the space to build against.'],
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
          <h1 className="max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Pre-construction
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            The work that happens before the work — so the number holds up and the
            schedule is real.
          </p>
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
            behind.
          </p>
        </div>
      </Section>

      {/* What it covers */}
      <Section muted>
        <Eyebrow>What pre-construction covers</Eyebrow>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {COVERS.map(([title, body]) => (
            <div key={title} className="rounded-lg border border-stone-200 bg-paper p-5">
              <div className="font-semibold text-navy">{title}</div>
              <p className="mt-1 text-sm text-stone-600">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* What you get */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>What you get out of it</Eyebrow>
          <ul className="mt-4 space-y-3 text-lg text-stone-600">
            <li className="flex gap-3">
              <span aria-hidden className="text-accent">→</span>
              A defensible number you can hand to an owner or a lender.
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="text-accent">→</span>
              A realistic schedule that accounts for permitting and lead times.
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="text-accent">→</span>
              Fewer change orders, because the surprises got found early.
            </li>
          </ul>
        </div>
      </Section>

      {/* When to bring a GC in */}
      <Section muted>
        <div className="max-w-3xl">
          <Eyebrow>When to bring a GC in</Eyebrow>
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
        heading="Being asked for a number?"
        body="Call us before you guess. We'll help you get to one you can defend."
      />
    </>
  );
}

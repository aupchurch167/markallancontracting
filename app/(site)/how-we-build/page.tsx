import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { Section, Eyebrow } from '@/components/Section';
import { SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'How We Build — Our Process, Start to Finish',
  description:
    'Plain-language walkthrough of a commercial buildout with Mark Allan Contracting — site walk to closeout. Family-owned since 1999.',
  path: '/how-we-build',
});

const PHASES = [
  {
    name: 'Site walk',
    we: 'We come out, look at the space, and ask the questions that change the price — existing conditions, what the landlord left undone, what your use requires.',
    you: 'Show us the space and share the drawings or lease exhibit if you have them.',
    time: 'About an hour, scheduled within days.',
  },
  {
    name: 'Estimate',
    we: 'We scope it trade by trade and hand you a real number you can take to your owner — not a range.',
    you: 'Tell us the target date and any budget you have to hit.',
    time: 'Days, not weeks, on most interiors.',
  },
  {
    name: 'Contract',
    we: 'We put the scope, the number, and the schedule in writing so everyone is working from the same document.',
    you: 'Review, ask questions, sign.',
    time: 'Turns as fast as you do.',
  },
  {
    name: 'Mobilize',
    we: 'We pull permits, order long-lead items, and get crews scheduled.',
    you: 'Coordinate landlord access and any tenant requirements.',
    time: 'Driven mostly by permitting and lead times.',
  },
  {
    name: 'Build',
    we: 'Crews self-perform the interior trades and manage the rest. Work gets done in sequence.',
    you: 'Stay in the loop; weigh in on the decisions that are yours.',
    time: 'Weeks, set by scope — see each service page for typical ranges.',
  },
  {
    name: 'Punch',
    we: 'We walk the space, build the list, and close it out — including franchisor or health-department punch where it applies.',
    you: 'Walk it with us and flag anything you see.',
    time: 'Days.',
  },
  {
    name: 'Closeout',
    we: 'We hand over documentation, warranties, and what you need for occupancy.',
    you: 'Get your certificate of occupancy and open.',
    time: 'At substantial completion.',
  },
];

export default async function HowWeBuildPage() {
  const { phone, phoneRaw } = await getSiteSettings();

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            How we build
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            The whole job, start to finish, in plain language. What we do, what you
            do, and roughly how long each part takes.
          </p>
        </div>
      </section>

      {/* Company background — About lives here, not a standalone page */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Who you&apos;re working with</Eyebrow>
          <p className="mt-3 text-lg leading-relaxed text-stone-600">
            {SITE.name} has been building out commercial space since {SITE.established}.
            Family-owned, working across Georgia, Tennessee, Alabama, and South
            Carolina, on projects from {SITE.projectRange}. We started with over a
            hundred Domino&apos;s buildouts and have done work for Darden since. The
            people who price your job are the people who show up to build it — and
            we&apos;ve developed and operated our own commercial property, so we know
            what an owner is actually worried about.
          </p>
        </div>
      </Section>

      {/* Phases */}
      <Section muted>
        <div className="space-y-6">
          {PHASES.map((p, i) => (
            <div
              key={p.name}
              className="grid gap-4 rounded-lg border border-stone-200 bg-paper p-6 sm:grid-cols-[auto,1fr]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
                {i + 1}
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy">{p.name}</h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-accent">We do</dt>
                    <dd className="mt-1 text-sm text-stone-600">{p.we}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-accent">You do</dt>
                    <dd className="mt-1 text-sm text-stone-600">{p.you}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-accent">How long</dt>
                    <dd className="mt-1 text-sm text-stone-600">{p.time}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Links down */}
      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { href: '/pre-construction', title: 'Pre-Construction', body: 'Getting to a defensible number before scope is locked.' },
            { href: '/construction-process', title: 'Our Process', body: 'A deeper look at how a job runs day to day.' },
            { href: '/new-construction', title: 'New Construction', body: 'What we take on for ground-up today.' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group rounded-lg border border-stone-200 p-6 transition-colors hover:border-accent hover:bg-stone-50"
            >
              <div className="text-lg font-bold text-navy group-hover:text-accent">{l.title}</div>
              <p className="mt-2 text-sm text-stone-600">{l.body}</p>
            </Link>
          ))}
        </div>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}

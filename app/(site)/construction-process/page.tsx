import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/queries';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'The Commercial Construction Process — What to Expect',
  description:
    'How a commercial buildout actually runs: the schedule shape, who is on site, how change orders and communication work, closeout, and a plain-language glossary.',
  path: '/construction-process',
});

/**
 * Claim honesty: describe the process as it actually runs. Do NOT turn this into
 * a responsiveness guarantee. Name how communication works; do not promise a
 * standard the field has not consistently delivered.
 */

// Illustrative schedule shares (relative durations, not precise data).
const SCHEDULE = [
  { name: 'Permitting & long-lead', pct: 22, note: 'Often starts before the build — and usually what moves a date', color: 'bg-navy-900' },
  { name: 'Mobilize', pct: 12, note: 'Permits in hand, crews scheduled, long-lead items ordered', color: 'bg-navy-700' },
  { name: 'Rough-in', pct: 30, note: 'The work behind the walls — framing and MEP', color: 'bg-navy-600' },
  { name: 'Finishes', pct: 26, note: 'Drywall, paint, ceilings, flooring, fixtures', color: 'bg-accent-700' },
  { name: 'Punch & closeout', pct: 10, note: 'Final list, inspections, and the CO', color: 'bg-accent' },
];

const ROLES = [
  {
    name: 'Project Manager',
    body: 'Owns the budget, the schedule, and the paperwork. Your point of contact for anything that changes the number or the date.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    name: 'Superintendent',
    body: 'Runs the site day to day — sequencing the trades, keeping work moving, and catching problems before they cost you.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    ),
  },
  {
    name: 'Self-perform crews',
    body: 'Our own framing, drywall, paint, ceiling, and flooring crews. Fewer separate subs to coordinate, one party accountable for the finish.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
    ),
  },
  {
    name: 'Specialty subs',
    body: 'Licensed MEP and specialty trades, scheduled and supervised the same way — held to the same schedule as our own crews.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
];

const CO_STEPS = [
  { title: 'A condition changes', body: 'Something in the field differs from the plans — a hidden condition, an owner request, a code trigger.' },
  { title: 'We price it', body: 'We scope the change and put the number and any schedule impact in writing.' },
  { title: 'You approve', body: 'Nothing proceeds until you say yes. No surprise line items on the final invoice.' },
  { title: 'Work proceeds', body: 'The change gets built and documented against the approved order.' },
];

const TOUCHPOINTS = [
  { when: 'At mobilization', what: 'Who your point of contact is, and what happens first on site.' },
  { when: 'Before inspections & at milestones', what: 'When a phase wraps or an inspection is coming up.' },
  { when: 'When the number or date moves', what: 'If a condition changes the budget or the schedule, you hear what and why.' },
  { when: 'Throughout', what: 'CompanyCam photos document the work as it happens.' },
];

const CLOSEOUT = [
  'Punch list completed and signed off',
  'Warranties on the work and equipment',
  'O&M manuals for the installed systems',
  'As-built documentation',
  'Certificate of Occupancy — the keys to opening',
  'Franchisor or health-department sign-off where it applies',
];

const GLOSSARY: [string, string][] = [
  ['Rough-in', 'The behind-the-walls phase — framing, plus the electrical, plumbing, and HVAC lines run before anything gets covered.'],
  ['Punch list', 'The final list of small items to fix or finish before a job is called done.'],
  ['Change order', 'A written, priced, and approved change to the scope — approved before the work happens.'],
  ['RFI', 'Request for Information — a formal question to the architect or owner when the plans are unclear.'],
  ['Submittal', 'Product data or samples sent for approval before an item is ordered or installed.'],
  ['Long-lead item', 'Equipment or materials with weeks-to-months lead times, ordered early so they don’t hold up the job.'],
  ['Value engineering', 'Finding a cheaper way to the same result — swapping a spec or a method to protect the budget.'],
  ['Substantial completion', 'The point where the space is usable for its purpose, even if minor punch items remain.'],
  ['Certificate of Occupancy (CO)', 'The jurisdiction’s sign-off that the space is legal to occupy. No CO, no opening.'],
  ['Self-perform', 'Trades done by our own crews instead of subcontracted out.'],
];

export default async function ConstructionProcessPage() {
  const { phone, phoneRaw } = await getSiteSettings();

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'How We Build', path: '/how-we-build' },
          { name: 'Our Process', path: '/construction-process' },
        ]}
      />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            What to expect
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            What a job actually looks like
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            Straight talk about how a commercial buildout runs — the order things
            happen, who’s on site, how changes and money get handled, and what you
            walk away with. No jargon left unexplained.
          </p>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} />
          </div>
        </div>
      </section>

      {/* The shape of a job — schedule visual */}
      <Section>
        <Eyebrow>The shape of a job</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
          The order things happen — and where the time goes
        </h2>
        <p className="mt-3 max-w-2xl text-stone-600">
          A commercial interior, start to finish. The construction is the
          predictable part; permitting and long-lead items are usually what move a
          date.
        </p>

        <div className="mt-8 overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Bar */}
            <div className="flex h-14 overflow-hidden rounded-lg" role="img" aria-label="Relative duration of each phase of a commercial buildout">
              {SCHEDULE.map((s) => (
                <div
                  key={s.name}
                  className={`${s.color} flex items-center justify-center px-2`}
                  style={{ width: `${s.pct}%` }}
                >
                  <span className="truncate text-xs font-semibold text-white sm:text-sm">
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
            {/* Notes aligned under each segment */}
            <div className="mt-3 flex">
              {SCHEDULE.map((s) => (
                <div key={s.name} className="px-2" style={{ width: `${s.pct}%` }}>
                  <p className="text-xs leading-snug text-stone-500">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm italic text-stone-400">
          Illustrative — actual durations vary by scope. See each service page for
          typical ranges.
        </p>
      </Section>

      {/* Who's on your job */}
      <Section muted>
        <Eyebrow>Who’s on your job</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
          The people running the work
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {ROLES.map((role) => (
            <div key={role.name} className="flex gap-4 rounded-lg border border-stone-200 bg-paper p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  {role.icon}
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy">{role.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{role.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* How change orders work — flow */}
      <Section>
        <Eyebrow>How change orders work</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
          No surprises on the final invoice
        </h2>
        <p className="mt-3 max-w-2xl text-stone-600">
          A change order is a change in scope — priced and approved before the work
          happens, not discovered when the bill arrives.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CO_STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-lg border border-stone-200 bg-paper p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                {i + 1}
              </div>
              <h3 className="mt-3 font-bold text-navy">{step.title}</h3>
              <p className="mt-1 text-sm text-stone-600">{step.body}</p>
              {i < CO_STEPS.length - 1 && (
                <span aria-hidden className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-2xl text-stone-300 lg:block">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* How you stay in the loop */}
      <Section muted>
        <Eyebrow>How you stay in the loop</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
          The points where you’ll hear from us
        </h2>
        <div className="mt-8 max-w-3xl">
          <ol className="relative space-y-6 border-l-2 border-stone-200 pl-6">
            {TOUCHPOINTS.map((t) => (
              <li key={t.when} className="relative">
                <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-accent bg-paper" />
                <div className="font-bold text-navy">{t.when}</div>
                <p className="mt-1 text-stone-600">{t.what}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Closeout checklist */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr,1.4fr] lg:items-start">
          <div>
            <Eyebrow>What you get at closeout</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
              The handoff, in writing
            </h2>
            <p className="mt-3 text-stone-600">
              A job isn’t done when the work stops — it’s done when you have what you
              need to occupy and operate the space.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {CLOSEOUT.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-lg border border-stone-200 bg-paper p-4">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-stone-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Jargon buster */}
      <Section muted>
        <Eyebrow>Jargon buster</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
          The words that show up on your job
        </h2>
        <p className="mt-3 max-w-2xl text-stone-600">
          Every trade has its shorthand. Here’s the plain-language version of the
          terms you’ll hear.
        </p>
        <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {GLOSSARY.map(([term, def]) => (
            <div key={term} className="border-l-2 border-accent pl-4">
              <dt className="font-bold text-navy">{term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-stone-600">{def}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}

import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/queries';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'The Commercial Construction Process — What to Expect',
  description:
    'How a commercial buildout runs day to day: schedule, change orders, who is on site, how progress gets communicated, and closeout.',
  path: '/construction-process',
});

/**
 * Claim honesty: describe the process as it actually runs. Do NOT turn this into
 * a responsiveness guarantee. Name how communication works, do not promise a
 * standard the field has not consistently delivered.
 */
const TOPICS = [
  {
    title: 'Schedule expectations',
    body: 'The schedule is set in the contract and driven by scope, permitting, and lead times. We build to it in sequence. Where something outside our control moves — an inspection backlog, a long-lead item — you hear what moved and what it does to the date.',
  },
  {
    title: 'Change orders',
    body: 'A change order is a change in scope, priced and approved before the work happens — not a surprise on the final invoice. If a condition in the field changes the number, we tell you what and why, and you decide before we proceed.',
  },
  {
    title: 'Who is on site',
    body: 'Our crews self-perform the interior trades — framing, drywall, paint, ACT, flooring. That means fewer separate subs to coordinate and one party accountable for the finish. Managed trades are scheduled and supervised the same way.',
  },
  {
    title: 'How progress gets communicated',
    body: 'You get a point of contact on the job and updates at the points that matter — mobilization, inspections, milestones, and anything that changes the schedule or the number. CompanyCam photos document the work as it happens.',
  },
  {
    title: 'Closeout documentation',
    body: 'At the end you get what you need to occupy and operate: punch completion, warranties, and closeout documents, including franchisor or health-department sign-off where it applies.',
  },
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

      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            What a job actually looks like
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            The details of how a commercial buildout runs, from mobilization to
            closeout.
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl space-y-10">
          {TOPICS.map((t) => (
            <div key={t.title}>
              <Eyebrow>{t.title}</Eyebrow>
              <p className="mt-3 text-lg leading-relaxed text-stone-600">{t.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}

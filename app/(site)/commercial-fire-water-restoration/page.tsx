import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { getSiteSettings } from '@/lib/queries';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { FAQ } from '@/components/FAQ';
import { PhotoSlot } from '@/components/Placeholder';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';

const DESCRIPTION =
  'For property managers and business owners: we rebuild fire- and water-damaged commercial space so tenants can reopen. Atlanta GC since 1999.';

export const metadata: Metadata = pageMetadata({
  title: 'Commercial Fire & Water Damage Restoration',
  description: DESCRIPTION,
  path: '/commercial-fire-water-restoration',
});

const LINK = 'font-semibold text-maroon hover:text-maroon-dark';

const STEPS: { title: string; body: ReactNode }[] = [
  {
    title: 'Secure the space and protect adjacent suites',
    body: 'We tarp, board up, and seal off the damaged suite before demo starts. Smoke and dust travel through shared ceilings and ductwork, so we protect the tenants next door.',
  },
  {
    title: 'Scope with owner, PM, and insurance company',
    body: 'Commercial fire damage restoration has more people at the table. The owner, the property manager, the tenant, and the insurance company all need the same scope. We write it line by line and walk everyone through it.',
  },
  {
    title: 'Phase the work so unaffected units stay open',
    body: 'Where the building allows it, we schedule loud and dirty work around the tenants still operating, because their rent keeps your building going.',
  },
  {
    title: 'Permits, inspections, CO/reopening',
    body: (
      <>
        We pull permits, schedule inspections, and work toward the sign-off a tenant
        needs to reopen. See our{' '}
        <Link href="/project-types/tenant-improvements" className={LINK}>tenant improvement</Link> work.
      </>
    ),
  },
];

const FAQS = [
  {
    q: 'How fast can you start on a commercial loss?',
    a: 'Call us and we’ll tell you honestly when we can get there. {{PLACEHOLDER: response time, Adam to confirm before any promise}} We do emergency roof weatherproofing and board-up first, because rain and break-ins make a loss bigger. The full rebuild starts once the scope is approved.',
  },
  {
    q: 'Can unaffected tenants stay open during the rebuild?',
    a: 'Often, depending on the building and the damage. We seal off the work area and schedule around tenants who are still operating where the building allows it.',
  },
  {
    q: 'Do you handle permits and reinspection for reopening?',
    a: 'Yes, we pull the permits and schedule the inspections. A space can’t reopen without sign-off, so we plan inspections into the schedule from day one.',
  },
  {
    q: 'Who do we deal with day to day?',
    a: 'One point of contact at MAC for the whole job. You also get shared project access, so you can see the project photos and updates without chasing anyone for status.',
  },
  {
    q: 'Do you work with our insurance carrier?',
    a: 'Yes. We walk the loss with your carrier when we can and explain our estimate line by line. Then we build to the approved scope.',
  },
  {
    q: 'What size commercial losses do you take?',
    a: '{{PLACEHOLDER: Adam to confirm the $50K-$500K sweet spot applies to insurance work}} Call us with the details and we’ll tell you on the first call if the job fits.',
  },
];

export default async function CommercialFireWaterRestorationPage() {
  const { phone, phoneRaw, email } = await getSiteSettings();

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Insurance Claim Rebuilds', path: '/insurance-claim-rebuilds' },
          { name: 'Commercial Fire & Water Restoration', path: '/commercial-fire-water-restoration' },
        ]}
      />
      <JsonLd
        data={serviceSchema({ name: 'Commercial Fire and Water Damage Restoration', description: DESCRIPTION })}
      />

      <section className="bg-ink text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-rose">
            Commercial restoration
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Commercial Fire and Water Damage Restoration
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-cream-muted">
            The restaurant next door is open. Yours has a handwritten sign on the
            glass and a dumpster in the lot. Every day the doors stay locked, the
            rent’s still due and the staff are picking up shifts somewhere else.
          </p>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} className="btn-call-ondark" />
          </div>
        </div>
      </section>

      <Section>
        <Eyebrow>The one question</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Getting tenants back open</h2>
        <div className="prose-copy mt-5">
          <p>
            Commercial fire restoration runs on one question: when can we reopen?
            We’ve built tenant improvements, restaurants, and retail space in Metro
            Atlanta since 1999. That’s the same work a commercial rebuild comes down
            to, so we know what an inspector wants to see before a space gets its
            doors back. We’ve done commercial insurance projects too. Recent work
            includes a fire rebuild of about $500K, more than 50 flood, fallen-tree
            and roof repairs after Hurricane Helene, and, on the residential side, a
            home fire rebuild of about $800K in Vinings.
          </p>
          <p>
            This page is for property managers, facility managers, and business
            owners. If you’re a homeowner, see our{' '}
            <Link href="/insurance-claim-rebuilds" className={LINK}>insurance claim rebuilds</Link>{' '}
            page and call us.
          </p>
        </div>
      </Section>

      <Section muted>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">How a commercial rebuild runs</h2>
        <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-body">
          We board up, handle water mitigation and dry-out, and run the rebuild.
          Electrical, plumbing, and HVAC go to our licensed partner trades.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-[2px] border border-hairline bg-paper p-7">
              <div className="font-display text-lg font-semibold text-maroon">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="mt-2 text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-body">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Who it’s for</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">For property managers</h2>
            <p className="prose-copy mt-5">
              You get one point of contact for the whole job. You also get shared
              project access, so you can see the project photos and updates and
              answer the owner without driving out to the site. See how we work with{' '}
              <Link href="/markets/property-managers" className={LINK}>property managers</Link> and{' '}
              <Link href="/markets/facility-managers" className={LINK}>facility managers</Link>.
            </p>
          </div>
          <div>
            <Eyebrow>Who it’s for</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">For business owners</h2>
            <p className="prose-copy mt-5">
              You need a reopening date you can plan around. We’ll give you one once
              the scope is approved and permits are in, and we’ll tell you the minute
              it moves. We’ve built out{' '}
              <Link href="/project-types/restaurant-buildout" className={LINK}>restaurants</Link> and{' '}
              <Link href="/project-types/retail-buildout" className={LINK}>retail</Link> space, so we
              know where the inspector looks. Franchise operators, see our{' '}
              <Link href="/markets/franchise-restaurant-operators" className={LINK}>franchise restaurant</Link> page.
            </p>
          </div>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <PhotoSlot label="photo: ~$500K fire rebuild (no tenant names/logos)" />
          <PhotoSlot label="photo: Hurricane Helene flood / tree / roof repairs" />
          <PhotoSlot label="photo: ~$800K Vinings build-back (no address)" />
        </div>
      </Section>

      <Section muted>
        <Eyebrow>Insurance</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Insurance</h2>
        <p className="prose-copy mt-5">
          We walk the loss with your carrier, explain our estimate, and build to the
          approved scope. More on our{' '}
          <Link href="/insurance-claim-rebuilds" className={LINK}>insurance claim rebuilds</Link> page, plus{' '}
          <Link href="/fire-damage-reconstruction-atlanta" className={LINK}>fire damage reconstruction</Link>,{' '}
          <Link href="/water-damage-repair-atlanta" className={LINK}>water damage repair</Link>, and our{' '}
          <Link href="/project-types/building-repair" className={LINK}>building repair</Link> work.
        </p>
      </Section>

      <Section>
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">FAQ</h2>
          <div className="mt-6">
            <FAQ faqs={FAQS} />
          </div>
        </div>
      </Section>

      <CallCTA
        phone={phone}
        phoneRaw={phoneRaw}
        heading="Talk to us before you sign with a contractor."
        body={`Call us or email ${email}, and send us photos of the damage through our contact page. We walk it, price it line by line, and tell you on the first call if we’re not the right fit.`}
      />
    </>
  );
}

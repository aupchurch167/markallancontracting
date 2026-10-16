import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { getSiteSettings } from '@/lib/queries';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { FAQ } from '@/components/FAQ';
import { Placeholder, PhotoSlot } from '@/components/Placeholder';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';

const DESCRIPTION =
  'After a fire, we handle the rebuild: structural repair, framing, drywall, finishes, final walk. Atlanta GC since 1999. Call (404) 724-8709.';

export const metadata: Metadata = pageMetadata({
  title: 'Fire Damage Restoration & Rebuild in Atlanta',
  description: DESCRIPTION,
  path: '/fire-damage-reconstruction-atlanta',
});

const LINK = 'font-semibold text-maroon hover:text-maroon-dark';

const STEPS: { label: string; note: ReactNode }[] = [
  {
    label: 'Secure the building (tarp, board-up)',
    note: (
      <>
        We tarp the roof and board the openings. On one fire-damaged condo, our crew
        weatherproofed the roof the same afternoon and sealed it before the next
        day’s storm. More on that in our{' '}
        <Link href="/insights/emergency-roof-tarping" className={LINK}>emergency roof tarping</Link> notes.
      </>
    ),
  },
  {
    label: 'Walk the loss and write the scope',
    note: 'We walk it, open what needs opening, and photograph everything. Our scope is line by line, so your insurance company can see what we’re pricing and why.',
  },
  {
    label: 'Demo and haul-off of damaged material',
    note: (
      <>
        Burnt and smoke-soaked material comes out down to sound structure. Smoke
        gets into insulation and framing cavities far from the burn, so we follow
        it. See <Link href="/insights/demo-phase" className={LINK}>how we handle demo</Link>.
      </>
    ),
  },
  {
    label: 'Structural repair and framing',
    note: 'We sister or replace charred joists, studs, and rafters. Anything structural gets checked before it gets covered, because you only get one chance to see it.',
  },
  {
    label: 'MEP rough-in and inspections',
    note: (
      <>
        Fire-damaged wiring gets replaced. Our licensed partner trades do the
        electrical, plumbing, and HVAC rough-in, and the city inspects before
        anything closes up. We pull the{' '}
        <Link href="/insights/permitting" className={LINK}>permits</Link>.
      </>
    ),
  },
  {
    label: 'Insulation, drywall, finishes',
    note: 'New insulation, drywall, paint, flooring, doors, trim. Our crews do most of this work themselves.',
  },
  {
    label: 'Final walk and punch list',
    note: 'We walk it with you, write down every item, and close them out. Then you get the keys back.',
  },
];

const COST_FACTORS = [
  { lead: 'Structural damage.', body: 'Cosmetic char on drywall costs a fraction of replacing a roof system.' },
  { lead: 'How far the smoke went.', body: 'Smoke travels through ceilings and wall cavities. The more rooms it reached, the more comes out.' },
  { lead: 'Code upgrades.', body: 'A permit on an older building can trigger electrical or life-safety work the old building never had.' },
  { lead: 'Finishes.', body: 'Matching existing tile or millwork costs more than standard material.' },
];

const FAQS = [
  {
    q: 'How long does a fire rebuild take?',
    a: 'It depends on how much structure burned and how long permits take. {{PLACEHOLDER: fire timeline range from Justin}} A kitchen fire that stayed in one room moves faster than a roof that burned through. We’ll give you a schedule once we’ve walked it and the scope is approved.',
  },
  {
    q: 'How much does fire damage restoration cost in Atlanta?',
    a: 'We price it after we walk it, because the number depends on structure, smoke spread, code upgrades, and finishes. {{PLACEHOLDER: fire cost ranges from Justin}} You’ll get a line-item estimate, so you and your insurance company can see every quantity.',
  },
  {
    q: 'Do you do the smoke and soot cleanup or just the rebuild?',
    a: 'We board up, handle mitigation, and rebuild. Smoke-damaged material comes out during demo. For anything that’s staying, we’ll talk through cleanup on the walk and tell you how we’d handle it.',
  },
  {
    q: 'Do I need permits to rebuild after a fire?',
    a: 'Yes, almost always for structural, electrical, plumbing, and mechanical work. We pull the permits and schedule the inspections, because the building can’t be closed up or reoccupied without them. A permit can also trigger code upgrades, and we flag those early.',
  },
  {
    q: 'Will you work with my insurance company?',
    a: 'Yes. We walk the loss with them when we can and explain our estimate line by line. Then we build to the approved scope.',
  },
  {
    q: 'Can you tarp or board up the building right away?',
    a: 'Yes, we do emergency roof weatherproofing and board-up. On one fire-damaged condo, our crew had the roof weatherproofed the same afternoon and sealed before the next day’s storm. Call us and we’ll tell you when we can get there.',
  },
];

export default async function FireDamageReconstructionPage() {
  const { phone, phoneRaw, email } = await getSiteSettings();

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Insurance Claim Rebuilds', path: '/insurance-claim-rebuilds' },
          { name: 'Fire Damage Reconstruction', path: '/fire-damage-reconstruction-atlanta' },
        ]}
      />
      <JsonLd data={serviceSchema({ name: 'Fire Damage Reconstruction', description: DESCRIPTION })} />

      <section className="bg-ink text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-rose">Fire damage</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Fire Damage Reconstruction in Atlanta
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-cream-muted">
            The fire’s been out for days. The carpet squishes. Somebody taped a
            plastic sheet over the window the firefighters broke, and it snaps every
            time the wind picks up. The owner is standing in the doorway trying to
            figure out what’s salvageable.
          </p>
          <p className="mt-3.5 max-w-2xl text-lg font-medium text-cream">
            Most of it isn’t. We start there.
          </p>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} className="btn-call-ondark" />
          </div>
        </div>
      </section>

      <Section>
        <Eyebrow>Who we are</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
          Rebuilding after a fire in Atlanta
        </h2>
        <div className="prose-copy mt-5">
          <p>
            We’re the general contractor that puts the building back. We’ve been
            doing fire damage restoration in Atlanta since 1999, and we self-perform
            the non-specialty trades, so the crew that frames it is our crew.
          </p>
          <p>
            Who does what matters on a fire job. We board up and weatherproof first,
            because an open roof lets rain finish what the fire started. Then we
            handle mitigation, demo, structure, and every trade through the final
            walk. Electrical, plumbing, and HVAC go to our licensed partner trades.
          </p>
          <p>
            This page is for commercial and multifamily owners. If it’s your house,
            read our{' '}
            <Link href="/insights/residential-fire-damage" className={LINK}>residential fire damage notes</Link>{' '}
            first.
          </p>
        </div>
      </Section>

      <Section muted>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
          The fire rebuild process, step by step
        </h2>
        <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-body">
          Every fire is different. The order of work isn’t. Here’s the fire damage
          restoration process we run.
        </p>
        <div className="mt-10 grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,420px)]">
          <ol className="max-w-3xl space-y-5">
            {STEPS.map((s, i) => (
              <li key={s.label} className="flex items-start gap-4 text-body">
                <span aria-hidden className="mt-0.5 w-7 shrink-0 font-display text-lg font-semibold text-maroon">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="font-semibold text-ink">{s.label}</div>
                  <p className="mt-1 leading-relaxed">{s.note}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="grid gap-4">
            <PhotoSlot label="photo: roof tarp from a real job" />
            <PhotoSlot label="photo: ~$500K fire rebuild — framing repair" />
          </div>
        </div>
        <p className="mt-8 max-w-3xl border-t border-hairline pt-5 text-[17px] leading-relaxed text-body">
          The whole way through, you have one point of contact at MAC and shared
          project access, so you can see the project photos and updates yourself.
        </p>
      </Section>

      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Cost</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
            What fire damage repair costs
          </h2>
          <p className="mt-5">
            <Placeholder>fire cost ranges from Justin</Placeholder>
          </p>
          <p className="prose-copy mt-5">
            We won’t throw out a number before we’ve seen it, because fire damage
            restoration cost swings hard with a few things:
          </p>
          <ul className="mt-5 space-y-3 text-[17px] leading-relaxed text-body">
            {COST_FACTORS.map((f) => (
              <li key={f.lead} className="flex items-start gap-2.5">
                <span aria-hidden className="text-maroon">✓</span>
                <span>
                  <strong className="font-semibold text-ink">{f.lead}</strong> {f.body}
                </span>
              </li>
            ))}
          </ul>
          <p className="prose-copy mt-5">We’ll walk it and give you a line-item number.</p>
        </div>
      </Section>

      <Section muted>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Before you hire</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
              Choosing a fire restoration company
            </h2>
            <div className="prose-copy mt-5">
              <p>
                You’ll probably talk to a few fire damage restoration companies in
                Atlanta. Ask who’s actually swinging the hammers, their crew or
                whoever they can find that week. Ask what they do when demo turns up
                damage the scope missed. Ask who you call when you have a question.
                The answers tell you how the last month of your job goes.
              </p>
              <p>
                More on how we work with insurance on our{' '}
                <Link href="/insurance-claim-rebuilds" className={LINK}>insurance claim rebuilds</Link> page.
              </p>
            </div>
          </div>
          <div>
            <Eyebrow>Proof</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Recent fire rebuild</h2>
            <div className="prose-copy mt-5">
              <p>
                One recent fire rebuild came in at about $500K. Another was a 6,000
                square foot home in Vinings, worth over $1M, where the build-back ran
                about $800K.
              </p>
              <p>
                Water losses follow fires more often than people expect, so see our{' '}
                <Link href="/water-damage-repair-atlanta" className={LINK}>water damage repair</Link>{' '}
                page too. For business properties, see{' '}
                <Link href="/commercial-fire-water-restoration" className={LINK}>commercial fire and water restoration</Link>{' '}
                and our <Link href="/project-types/building-repair" className={LINK}>building repair</Link>{' '}
                work in <Link href="/locations/atlanta-ga" className={LINK}>Atlanta</Link>.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <PhotoSlot label="photo: ~$500K rebuild — finished interior" />
              <PhotoSlot label="photo: ~$800K Vinings build-back (no address)" />
            </div>
          </div>
        </div>
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

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
  'We dry it out and rebuild: drywall, flooring, cabinets, trim. Atlanta general contractor since 1999. Call (404) 724-8709.';

export const metadata: Metadata = pageMetadata({
  title: 'Water & Flood Damage Repair in Atlanta',
  description: DESCRIPTION,
  path: '/water-damage-repair-atlanta',
});

const LINK = 'font-semibold text-maroon hover:text-maroon-dark';

const SCOPE: { title: string; body: ReactNode }[] = [
  {
    title: 'Drywall and insulation',
    body: 'We cut out wet drywall and insulation during dry-out. We replace them, tape, finish, and paint so the patch doesn’t show.',
  },
  {
    title: 'Flooring',
    body: (
      <>
        LVP, carpet, tile, and subfloor where it delaminated. See our{' '}
        <Link href="/project-types/flooring-interior-trades" className={LINK}>flooring and interior trades</Link> work.
      </>
    ),
  },
  {
    title: 'Cabinets, trim, and finishes',
    body: 'Base cabinets swell when they sit in water. We replace boxes, doors, countertops, baseboard, and casing, and match what’s left where we can.',
  },
];

const FAQS = [
  {
    q: 'Do you do water extraction and drying?',
    a: 'Yes. We handle mitigation and dry-out ourselves, then rebuild. You don’t have to manage a handoff between two companies.',
  },
  {
    q: 'When can rebuilding start after water damage?',
    a: 'Rebuilding starts once our moisture readings show the structure is dry. We won’t close any wall before that, because wet framing behind new drywall grows mold. We also need an approved scope from your insurance company.',
  },
  {
    q: 'Do you handle mold?',
    a: 'No, we don’t do mold remediation. A licensed remediator handles that. After they finish and clearance is documented, we rebuild the drywall, insulation, and finishes.',
  },
  {
    q: 'Can you match existing flooring and cabinets?',
    a: 'Often, but not always. Discontinued flooring and older cabinet lines can be hard to find. We’ll tell you before we order whether we can get a match, and if we can’t, we’ll lay out the options so you can take them to your insurance company.',
  },
  {
    q: 'What does water damage repair cost?',
    a: 'We price it after we walk it, because cost depends on how high the water got, how many units it hit, and what finishes go back. {{PLACEHOLDER: water cost ranges from Justin}} You’ll get a line-item estimate you and your insurance company can read.',
  },
  {
    q: 'Will you work with my insurance company?',
    a: 'Yes. We walk the loss with them when we can and explain our estimate line by line. Then we build to the approved scope.',
  },
];

export default async function WaterDamageRepairPage() {
  const { phone, phoneRaw, email } = await getSiteSettings();

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Insurance Claim Rebuilds', path: '/insurance-claim-rebuilds' },
          { name: 'Water & Flood Damage Repair', path: '/water-damage-repair-atlanta' },
        ]}
      />
      <JsonLd data={serviceSchema({ name: 'Water and Flood Damage Repair', description: DESCRIPTION })} />

      <section className="bg-ink text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-rose">
            Water &amp; flood damage
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Water and Flood Damage Repair in Atlanta
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-cream-muted">
            A property manager stands in an inch of water in a ground-floor unit.
            Fans are already roaring in the hallway. She’s holding her phone with the
            insurance company’s PDF open, scrolling, trying to find where it says who
            puts the drywall back.
          </p>
          <p className="mt-3.5 max-w-2xl text-lg font-medium text-cream">That part’s us.</p>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} className="btn-call-ondark" />
          </div>
        </div>
      </section>

      <Section>
        <Eyebrow>One company</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">We dry it out and rebuild it</h2>
        <div className="prose-copy mt-5">
          <p>
            Mark Allan Contracting handles water mitigation, dry-out, and the
            rebuild. One company from the wet floor to the final walk.
          </p>
          <p>
            We’ve done water damage repair in Atlanta since 1999. We self-perform the
            non-specialty trades, so the drywall and trim crews on your job are ours.
            Electrical, plumbing, and HVAC go to our licensed partner trades.
          </p>
        </div>
      </Section>

      <Section muted>
        <Eyebrow>Scope</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">What we rebuild</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {SCOPE.map((s) => (
            <div key={s.title} className="rounded-[2px] border border-hairline bg-paper p-7">
              <h3 className="text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-body">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <PhotoSlot label="photo: dry-out in progress" />
          <PhotoSlot label="photo: cut-out drywall" />
          <PhotoSlot label="photo: new flooring" />
          <PhotoSlot label="photo: finished cabinets" />
        </div>
      </Section>

      <Section>
        <Eyebrow>The handoff</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
          After cleanup: what happens next
        </h2>
        <div className="prose-copy mt-5">
          <p>
            Dry-out is done when the moisture readings say the structure is dry. We
            document those readings, because we won’t close a wall over wet framing.
            Mold grows in a closed wall.
          </p>
          <p>
            Then we walk it, write our scope line by line, and send it to you and your
            insurance company. Once the scope is approved, we build it. Water damage
            cleanup in Atlanta and the rebuild are often two different companies, and
            the handoff between them is where jobs stall. With us there’s no handoff.
            You have one point of contact at MAC and shared project access, so you can
            see the project photos and updates yourself.
          </p>
        </div>
      </Section>

      <Section muted>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Flood</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Rebuilding after a flood</h2>
            <p className="prose-copy mt-5">
              Flood water is dirtier than a burst pipe, and it usually hits more units
              at once. Flood damage restoration in Atlanta means cutting walls higher,
              replacing more subfloor, and checking for damage in places nobody can see
              from the hallway. We handle the water and everything after, unit by unit,
              so residents can move back in as each one finishes. After Hurricane
              Helene, we did more than 50 repair jobs: flooded units, trees through
              roofs, and roofs that just gave up.
            </p>
            <PhotoSlot className="mt-6 aspect-video" label="photo: Hurricane Helene flood / fallen-tree / roof repairs" />
          </div>
          <div className="space-y-10">
            <div>
              <Eyebrow>Mold</Eyebrow>
              <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
                Rebuild after mold remediation
              </h2>
              <p className="prose-copy mt-5">
                We don’t do mold remediation. A licensed remediator does that work.
                After they finish and clearance is documented, we rebuild.{' '}
                <Placeholder>Adam to confirm wording</Placeholder>
              </p>
            </div>
            <div>
              <Eyebrow>Insurance</Eyebrow>
              <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Working with your insurance</h2>
              <p className="prose-copy mt-5">
                We walk the loss with your insurance company, explain our estimate to
                you and the carrier, and build to the approved scope. See how that works
                on our{' '}
                <Link href="/insurance-claim-rebuilds" className={LINK}>insurance claim rebuilds</Link>{' '}
                page. Fire jobs often turn into water jobs from the hoses, so see{' '}
                <Link href="/fire-damage-reconstruction-atlanta" className={LINK}>fire damage reconstruction</Link>.
                For business properties, see{' '}
                <Link href="/commercial-fire-water-restoration" className={LINK}>commercial fire and water restoration</Link>,
                our <Link href="/project-types/building-repair" className={LINK}>building repair</Link> work,
                and <Link href="/remodeling" className={LINK}>remodeling</Link> in{' '}
                <Link href="/locations/atlanta-ga" className={LINK}>Atlanta</Link>.
              </p>
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

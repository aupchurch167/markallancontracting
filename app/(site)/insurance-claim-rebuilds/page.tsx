import type { Metadata } from 'next';
import Link from 'next/link';
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
  'Commercial GC rebuilding fire and water losses across Metro Atlanta since 1999. We work with your insurance company and build to the approved scope. (404) 724-8709';

export const metadata: Metadata = pageMetadata({
  title: 'Insurance Claim Contractor, Atlanta',
  description: DESCRIPTION,
  path: '/insurance-claim-rebuilds',
});

const LINK = 'font-semibold text-maroon hover:text-maroon-dark';

const STEPS = [
  {
    title: 'We walk the loss and write our own scope',
    body: 'We walk every room that got hit. We open walls where we need to, check framing, and photograph what we find. Then we write our own scope, line by line, because the insurance company’s first estimate is written before anyone has seen behind the drywall.',
  },
  {
    title: 'We explain our estimate to you and the carrier',
    body: 'When our number and the carrier’s number don’t match, we show our work. Each line has a quantity and a reason, and we’ll walk them through it on site or on the phone. Every number on our estimate is one we can stand behind.',
  },
  {
    title: 'We build to the approved scope, and flag anything that changes',
    body: 'Once the carrier approves a scope, that’s what we build. If demo turns up rot, a cracked joist, or wiring that won’t pass inspection, we stop, photograph it, and send it to you and your insurance company before we touch it. You decide what happens next with your carrier. Nothing outside the scope gets built without a paper trail, so nobody gets a surprise on the final invoice.',
  },
  {
    title: 'One point of contact and shared project access',
    body: 'You get one point of contact at MAC for the whole job. You also get shared project access, so you can see the project photos and updates yourself instead of waiting on a phone call.',
  },
];

const FAQS = [
  {
    q: 'Do you work directly with my insurance company?',
    a: 'Yes. We walk the loss with your insurance company when we can, send our line-item estimate, and answer their questions about quantities and methods. The settlement stays between you and your carrier.',
  },
  {
    q: 'What if your estimate is higher than the insurance company’s?',
    a: 'We show them where the difference is and why, line by line. Most gaps come from things nobody could see on the first walk, like damage behind walls or code items that come with a permit. We’ll explain our numbers. What gets paid is between you and your carrier.',
  },
  {
    q: 'Do I have to use the contractor my insurance company recommends?',
    a: 'That depends on your policy, so read it and ask your carrier. What we can do is walk the loss and give you our own scope and price, so you have something to compare.',
  },
  {
    q: 'What does “build to the approved scope” mean in practice?',
    a: 'It means we build what the carrier approved, and nothing else gets built without your sign-off. If we find more damage once walls are open, we photograph it and send it to you and your insurance company before doing that work. You take it up with your carrier. We keep building what’s approved in the meantime when we can.',
  },
  {
    q: 'Do you do board-up and dry-out, or just the rebuild?',
    a: 'We do all of it. We board up after a fire, handle water mitigation and dry-out, and then rebuild through the final walk. On one fire-damaged condo, our crew weatherproofed the roof the same afternoon and had it sealed before the next day’s storm.',
  },
  {
    q: 'How will I know where my job stands?',
    a: 'You get one point of contact at MAC for the whole job, plus shared project access, so you can see the project photos and updates yourself. Nobody has to chase anyone for status.',
  },
];

export default async function InsuranceClaimRebuildsPage() {
  const { phone, phoneRaw, email } = await getSiteSettings();

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: 'Insurance Claim Rebuilds', path: '/insurance-claim-rebuilds' },
        ]}
      />
      <JsonLd data={serviceSchema({ name: 'Insurance Claim Rebuilds', description: DESCRIPTION })} />

      <section className="bg-ink text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-rose">
            Insurance claim rebuilds
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Insurance Claim Rebuilds in Metro Atlanta
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-cream-muted">
            A week after the fire trucks leave, the building still smells. Wet char,
            burnt wiring, insulation that’s been sitting in water. The owner has a
            claim number, a voicemail from the insurance company, and three
            contractors who’ve already left business cards in the door.
          </p>
          <p className="mt-3.5 max-w-2xl text-lg font-medium text-cream">
            That’s usually when we get the call.
          </p>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} className="btn-call-ondark" />
          </div>
        </div>
      </section>

      <Section>
        <Eyebrow>Who we are</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
          A general contractor for insurance repairs
        </h2>
        <div className="prose-copy mt-5">
          <p>
            Mark Allan Contracting is a family-owned general contractor. We’ve been
            building in Metro Atlanta since 1999. We self-perform the non-specialty
            trades, so the framing, drywall, and finish crews on your job work for
            us. That matters on an insurance rebuild because the schedule doesn’t
            wait on three subs to return calls.
          </p>
          <p>
            We handle the job from the first call to the final walk: board-up after
            a fire, water mitigation and dry-out, and the rebuild. Electrical,
            plumbing, and HVAC go to our licensed partner trades. We handle{' '}
            <Link href="/fire-damage-reconstruction-atlanta" className={LINK}>fire damage reconstruction</Link>,{' '}
            <Link href="/water-damage-repair-atlanta" className={LINK}>water and flood damage repair</Link>, and{' '}
            <Link href="/commercial-fire-water-restoration" className={LINK}>commercial fire and water restoration</Link>{' '}
            for property managers and business owners. See our general{' '}
            <Link href="/project-types/building-repair" className={LINK}>building repair</Link> work and{' '}
            <Link href="/construction-process" className={LINK}>how we run a project</Link>.
          </p>
          <p>
            This page is for owners and managers of commercial and multifamily
            property with a covered loss. If your job is a single-family home, start
            with our{' '}
            <Link href="/insights/residential-fire-damage" className={LINK}>residential fire damage notes</Link>{' '}
            and give us a call. We’ll tell you straight if we’re the right fit.
          </p>
        </div>
      </Section>

      <Section muted>
        <Eyebrow>Insurance</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
          How we work with your insurance company
        </h2>
        <p className="mt-3 max-w-2xl text-[17px] text-body">
          On a claim, our job is simple: tell everybody what it takes to put the
          building back, and then do it. Here’s how that runs.
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
            <Eyebrow>Proof</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
              Recent insurance rebuilds
            </h2>
            <div className="prose-copy mt-5">
              <p>
                Some recent work: two fire rebuilds, one about $500K and one about
                $800K on a 6,000 square foot home in Vinings, plus more than 50
                flood, fallen-tree and roof repairs after Hurricane Helene.
              </p>
              <p>
                On another fire-damaged condo, our crew weatherproofed the roof the
                same afternoon we got the call. It was sealed before the next day’s
                storm rolled in. Rain on an open roof turns a fire claim into a fire
                and water claim. See how we handle{' '}
                <Link href="/insights/emergency-roof-tarping" className={LINK}>emergency roof tarping</Link>.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PhotoSlot className="col-span-2 aspect-video" label="photo: ~$500K fire rebuild — before / during / after (no address)" />
            <PhotoSlot label="photo: ~$800K Vinings fire build-back" />
            <PhotoSlot label="photo: Hurricane Helene flood / tree / roof repairs" />
            <PhotoSlot className="col-span-2 aspect-[3/1]" label="image: sample scope / estimate page, redacted" />
          </div>
        </div>
      </Section>

      <Section muted>
        <Eyebrow>Service area</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Where we work</h2>
        <p className="prose-copy mt-5">
          We’re based in Metro Atlanta and take insurance repair work across the
          metro, plus Georgia, Tennessee, Alabama, and South Carolina. If you searched
          for an insurance claim contractor near me and you’re in{' '}
          <Link href="/locations/atlanta-ga" className={LINK}>Atlanta</Link> or the
          surrounding counties, we can get someone out to walk it.{' '}
          <Placeholder>links to remaining location pages, Adam to confirm list</Placeholder>{' '}
          Property managers can also see{' '}
          <Link href="/markets/property-managers" className={LINK}>how we work with management companies</Link>.
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

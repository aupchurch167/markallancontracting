import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/queries';
import { getFeaturedSummaries } from '@/lib/projects';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { ServiceGrid } from '@/components/ServiceGrid';
import { ProjectCard } from '@/components/ProjectCard';
import { Section, Eyebrow } from '@/components/Section';
import { SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Commercial General Contractor in Metro Atlanta | Mark Allan Contracting',
  description:
    'Commercial buildouts and renovations across Georgia, Tennessee, Alabama, and South Carolina. Family-owned since 1999. Get a real number, not a range.',
  path: '/',
});

export default async function HomePage() {
  const settings = await getSiteSettings();
  const featured = await getFeaturedSummaries();
  const { phone, phoneRaw } = settings;

  return (
    <>
      {/* 1. Hero */}
      <section className="bg-navy text-white">
        <div className="container-page py-20 sm:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Your space, open on time.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-stone-100/90 sm:text-xl">
              Commercial buildouts and renovations across Georgia, Tennessee,
              Alabama, and South Carolina. Family-owned since 1999.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <CallButton phone={phone} phoneRaw={phoneRaw} />
              <a
                href="/contact"
                className="text-base font-semibold text-white underline decoration-accent decoration-2 underline-offset-4 hover:text-stone-200"
              >
                Send us your scope
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>The hard part</Eyebrow>
          <p className="mt-3 text-2xl font-semibold text-navy sm:text-3xl">
            You&apos;ve got a space that needs work and a date it has to be ready by.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-stone-600">
            Construction isn&apos;t the hard part. Finding someone who gives you a
            real number, starts when they said, and picks up when you call —
            that&apos;s the hard part.
          </p>
        </div>
      </Section>

      {/* 3. Plan + CTA */}
      <Section muted>
        <Eyebrow>How it works</Eyebrow>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {[
            {
              n: '1',
              title: 'Walk the space',
              body: 'We come out and ask the questions that change the price.',
            },
            {
              n: '2',
              title: 'Get a real number',
              body: 'A scoped estimate you can hand to your owner. Not a range.',
            },
            {
              n: '3',
              title: 'We build',
              body: 'Crews mobilize. Work gets done. You get your space back.',
            },
          ].map((step) => (
            <div key={step.n}>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
                {step.n}
              </div>
              <h3 className="mt-4 text-xl font-bold text-navy">{step.title}</h3>
              <p className="mt-2 text-stone-600">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <CallButton phone={phone} phoneRaw={phoneRaw} />
        </div>
      </Section>

      {/* 4. Authority */}
      <Section>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-stone-400">
            Since 1999
          </p>
          <p className="mt-3 text-2xl font-semibold text-navy sm:text-3xl">
            Twenty-five years. Georgia, Tennessee, Alabama, South Carolina. Over a
            hundred Domino&apos;s buildouts, and work for Darden since.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-stone-600">
            Family-owned, hands-on — and we&apos;ve been the owner too, so we know
            what an owner worries about.
          </p>
          <p className="mt-6 text-lg font-semibold text-navy">
            Projects from $50K to $500K.
          </p>
        </div>
      </Section>

      {/* 5. Service grid */}
      <Section muted>
        <h2 className="text-3xl font-bold text-navy">What we build</h2>
        <p className="mt-2 max-w-2xl text-stone-600">
          Commercial interiors and repairs across the Southeast.
        </p>
        <div className="mt-8">
          <ServiceGrid />
        </div>
      </Section>

      {/* 6. Featured projects */}
      {featured.length > 0 && (
        <Section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-navy">Recent work</h2>
              <p className="mt-2 text-stone-600">Delivered projects, not renderings.</p>
            </div>
            <a href="/projects" className="hidden text-sm font-semibold text-accent hover:text-accent-700 sm:block">
              All projects →
            </a>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )}

      {/* 7. Stakes */}
      <Section muted>
        <div className="max-w-3xl">
          <Eyebrow>You&apos;ve seen this before</Eyebrow>
          <p className="mt-3 text-xl leading-relaxed text-stone-600">
            Everybody&apos;s been on a job like this.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            The bid comes in low. The start date slips. Then the calls stop getting
            returned, and you&apos;re managing your contractor instead of your own
            work.
          </p>
          <p className="mt-4 text-lg font-semibold text-navy">
            The tenant doesn&apos;t care whose fault it was. They just know
            they&apos;re not open.
          </p>
        </div>
      </Section>

      {/* 8. Success */}
      <Section>
        <div className="max-w-3xl">
          <p className="text-2xl font-semibold text-navy sm:text-3xl">
            Space opens on time. Tenant moves in. Nobody had to chase anybody.
          </p>
        </div>
      </Section>

      {/* 9. Closing CTA */}
      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}

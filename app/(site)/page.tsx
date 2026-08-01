import type { Metadata } from 'next';

// Render dynamically: CMS edits (covers, text, photos) must appear immediately,
// and a CDN edge can't serve a stale page. The DB is only reachable at runtime.
export const dynamic = 'force-dynamic';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/queries';
import { getFeaturedSummaries } from '@/lib/projects';
import { getHomepageMedia } from '@/lib/homepage-media';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { ServiceGrid } from '@/components/ServiceGrid';
import { ProjectCard } from '@/components/ProjectCard';
import { Section, Eyebrow } from '@/components/Section';
import { StepLine } from '@/components/StepLine';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Commercial General Contractor in Metro Atlanta',
  description:
    'Commercial buildouts and renovations across Georgia, Tennessee, Alabama, and South Carolina. Family-owned since 1999. Get a real number, not a range.',
  path: '/',
});

export default async function HomePage() {
  const settings = await getSiteSettings();
  const featured = await getFeaturedSummaries();
  const media = await getHomepageMedia();
  const { phone, phoneRaw } = settings;

  return (
    <>
      {/* 1. Hero — oxblood band */}
      <section className="bg-oxblood text-bone">
        <div className="container-page py-24 sm:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-2xl">
              <div className="text-[10px] font-medium uppercase tracking-label text-brass">
                General Contracting · Established 1999
              </div>
              <h1 className="mt-6 text-4xl font-bold uppercase leading-[1.1] tracking-wordmark text-bone sm:text-5xl lg:text-6xl">
                Your space, open on time.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-bone/60 sm:text-xl">
                Commercial buildouts and renovations across Georgia.
                Family-owned since 1999.
              </p>
              <StepLine className="mt-9 h-9 w-44" label="The build process, milestone to completion" />
              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <CallButton phone={phone} phoneRaw={phoneRaw} className="btn-call-ondark" />
                <a
                  href="/contact"
                  className="text-[11px] font-bold uppercase tracking-label text-bone underline-offset-4 hover:text-brass hover:underline"
                >
                  Send us your scope
                </a>
              </div>
            </div>
            {/* Real delivered project — hidden on small screens to keep the
                phone CTA above the fold on mobile. */}
            <div className="relative hidden aspect-[4/3] overflow-hidden border-2 border-brass/30 lg:block">
              <Image
                src={media.hero.url}
                alt={media.hero.alt}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>The hard part</Eyebrow>
          <p className="mt-4 text-2xl font-medium leading-snug text-oxblood sm:text-3xl">
            You&apos;ve got a space that needs work and a date it has to be ready by.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-oxblood/65">
            Construction isn&apos;t the hard part. Finding someone who gives you a
            real number, starts when they said, and picks up when you call —
            that&apos;s the hard part.
          </p>
        </div>
      </Section>

      {/* 3. Plan + CTA */}
      <Section muted>
        <Eyebrow>How it works</Eyebrow>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {[
            {
              n: '01',
              title: 'Walk the space',
              body: 'We come out and ask the questions that change the price.',
            },
            {
              n: '02',
              title: 'Get a real number',
              body: 'A scoped estimate you can hand to your owner. Not a range.',
            },
            {
              n: '03',
              title: 'We build',
              body: 'Crews mobilize. Work gets done. You get your space back.',
            },
          ].map((step) => (
            <div key={step.n} className="border-t-2 border-brass/60 pt-5">
              <div className="text-[10px] font-medium uppercase tracking-label text-brass">
                Phase {step.n}
              </div>
              <h3 className="mt-3 text-xl font-bold uppercase tracking-heading text-oxblood">
                {step.title}
              </h3>
              <p className="mt-3 text-oxblood/65">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <CallButton phone={phone} phoneRaw={phoneRaw} />
        </div>
      </Section>

      {/* 4. About / history */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Since 1999</Eyebrow>
            <h2 className="mt-4 text-2xl font-bold uppercase tracking-heading text-oxblood sm:text-3xl">
              A family-owned builder that came up on the hard, repeatable work.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-oxblood/70">
              We started in 1999 doing franchise restaurant buildouts — over a
              hundred Domino&apos;s, and work for Darden ever since. That kind of
              work rewards one thing: getting it right, on schedule, every time.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-oxblood/70">
              Twenty-five years later we&apos;re a family-owned commercial general
              contractor working across Georgia, Tennessee, Alabama, and South
              Carolina — tenant buildouts, renovations, conversions, and repairs,
              mostly in the $50K to $500K range.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-oxblood/70">
              We&apos;ve been the owner too, so we know what it&apos;s like to wait
              on a number and a date. That&apos;s why we run jobs the way we do:
              real scope up front, straight updates along the way, and a space that
              opens when we said it would.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden border-2 border-brass/30 bg-stone-100">
            <Image
              src={media.about.url}
              alt={media.about.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* 4b. From the field — real jobsite photos */}
      <Section>
        <Eyebrow>From the field</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold uppercase tracking-heading text-oxblood">On the job</h2>
        <p className="mt-3 max-w-2xl text-oxblood/65">
          A few shots from delivered commercial projects across Metro Atlanta.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {media.gallery.map((photo, i) => (
            <div
              key={`${photo.url}-${i}`}
              className="relative aspect-[4/3] overflow-hidden border-2 border-brass/20 bg-stone-100"
            >
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Service grid */}
      <Section muted>
        <h2 className="text-3xl font-bold uppercase tracking-heading text-oxblood">What we build</h2>
        <p className="mt-3 max-w-2xl text-oxblood/65">
          Commercial interiors and repairs across the Southeast.
        </p>
        <div className="mt-10">
          <ServiceGrid />
        </div>
      </Section>

      {/* 6. Featured projects */}
      {featured.length > 0 && (
        <Section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-heading text-oxblood">Recent work</h2>
              <p className="mt-3 text-oxblood/65">Delivered projects, not renderings.</p>
            </div>
            <a
              href="/projects"
              className="hidden text-[11px] font-bold uppercase tracking-label text-brass hover:underline sm:block"
            >
              All projects →
            </a>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <p className="mt-4 text-xl leading-relaxed text-oxblood/70">
            Everybody&apos;s been on a job like this.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-oxblood/65">
            The bid comes in low. The start date slips. Then the calls stop getting
            returned, and you&apos;re managing your contractor instead of your own
            work.
          </p>
          <p className="mt-6 text-lg font-semibold text-oxblood">
            The tenant doesn&apos;t care whose fault it was. They just know
            they&apos;re not open.
          </p>
        </div>
      </Section>

      {/* 8. Success */}
      <Section>
        <div className="max-w-3xl">
          <p className="text-2xl font-medium leading-snug text-oxblood sm:text-3xl">
            Space opens on time. Tenant moves in. Nobody had to chase anybody.
          </p>
        </div>
      </Section>

      {/* 9. Closing CTA */}
      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}

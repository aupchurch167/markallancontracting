import type { Metadata } from 'next';

// ISR: refetch CMS content at runtime (the DB is unreachable at build).
export const revalidate = 30;
import Image from 'next/image';
import { getSiteSettings } from '@/lib/queries';
import { getFeaturedSummaries } from '@/lib/projects';
import { getHomepageMedia } from '@/lib/homepage-media';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { ServiceGrid } from '@/components/ServiceGrid';
import { ProjectCard } from '@/components/ProjectCard';
import { Section, Eyebrow } from '@/components/Section';
import { SITE } from '@/lib/constants';
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
      {/* 1. Hero */}
      <section className="bg-navy text-white">
        <div className="container-page py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Your space, open on time.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-stone-100/90 sm:text-xl">
                Commercial buildouts and renovations across Georgia.
                Family-owned since 1999.
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
            {/* Real delivered project — hidden on small screens to keep the
                phone CTA above the fold on mobile. */}
            <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/15 lg:block">
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

      {/* 4. About / history */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Since 1999</Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold text-navy sm:text-3xl">
              A family-owned builder that came up on the hard, repeatable work.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">
              We started in 1999 doing franchise restaurant buildouts — over a
              hundred Domino&apos;s, and work for Darden ever since. That kind of
              work rewards one thing: getting it right, on schedule, every time.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">
              Twenty-five years later we&apos;re a family-owned commercial general
              contractor working across Georgia, Tennessee, Alabama, and South
              Carolina — tenant buildouts, renovations, conversions, and repairs,
              mostly in the $50K to $500K range.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">
              We&apos;ve been the owner too, so we know what it&apos;s like to wait
              on a number and a date. That&apos;s why we run jobs the way we do:
              real scope up front, straight updates along the way, and a space that
              opens when we said it would.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200">
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
        <h2 className="mt-2 text-3xl font-bold text-navy">On the job</h2>
        <p className="mt-2 max-w-2xl text-stone-600">
          A few shots from delivered commercial projects across Metro Atlanta.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {media.gallery.map((photo, i) => (
            <div
              key={`${photo.url}-${i}`}
              className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone-100"
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

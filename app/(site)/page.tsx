import type { Metadata } from 'next';

// Render dynamically: CMS edits (covers, text, photos) must appear immediately,
// and a CDN edge can't serve a stale page. The DB is only reachable at runtime.
export const dynamic = 'force-dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { getAllProjectSummaries } from '@/lib/projects';
import { getHomepageMedia } from '@/lib/homepage-media';
import { CallButton } from '@/components/PhoneLink';
import { ProjectCard } from '@/components/ProjectCard';
import { Section, Eyebrow } from '@/components/Section';
import { ClientLogoStrip } from '@/components/ClientLogoStrip';
import { ProcessStrip } from '@/components/ProcessStrip';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Commercial General Contractor in Metro Atlanta',
  description:
    'Commercial buildouts and renovations across Georgia, Tennessee, Alabama, and South Carolina. Family-owned since 1999. Get a real number, not a range.',
  path: '/',
});

const WHAT_WE_BUILD = [
  {
    title: 'Tenant improvements',
    body: 'Office buildouts, suite renovations, and space reconfigurations for new and existing tenants.',
  },
  {
    title: 'Restaurant & retail buildouts',
    body: 'Kitchen, dining, and storefront construction for restaurants, cafes, and retail concepts.',
  },
  {
    title: 'Warehouse & industrial conversions',
    body: 'Converting raw or underutilized warehouse space into functional commercial environments.',
  },
  {
    title: 'Office renovations',
    body: 'Modernizing dated offices with new layouts, finishes, and infrastructure.',
  },
  {
    title: 'Repairs & restoration',
    body: 'Storm damage, structural repairs, roof work, water damage, and the calls that can’t wait until next month.',
  },
];

export default async function HomePage() {
  const settings = await getSiteSettings();
  const projects = await getAllProjectSummaries();
  const media = await getHomepageMedia();
  const { phone, phoneRaw, email } = settings;
  const recent = projects.slice(0, 3);

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
              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <CallButton phone={phone} phoneRaw={phoneRaw} label="Call us" className="btn-call-ondark" />
                <a
                  href="#recent-work"
                  className="text-[11px] font-bold uppercase tracking-label text-bone underline-offset-4 hover:text-brass hover:underline"
                >
                  See recent work
                </a>
              </div>
              <p className="mt-8 max-w-md text-sm text-bone/45">
                We self-perform non-specialty trades. That’s why we don’t wait on someone else’s
                schedule to start yours.
              </p>
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

      {/* 2. Process strip */}
      <ProcessStrip />

      {/* 3. Problem */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>The hard part</Eyebrow>
          <p className="mt-4 text-2xl font-medium leading-snug text-oxblood sm:text-3xl">
            You know how this usually goes.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-oxblood/65">
            The quote takes two weeks. Then the guy goes quiet. Then you’re the one making calls,
            chasing updates, explaining to your tenant why the space isn’t ready — apologizing for a
            mess you didn’t make.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-oxblood/65">
            Meanwhile the lease clock is running. Somebody’s paying for square footage nobody can use.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-oxblood/65">
            That’s the bar in this industry. It’s low. And it’s why finding a GC you can actually rely
            on feels harder than it should.
          </p>
        </div>
      </Section>

      {/* 4. About / Since 1999 */}
      <Section muted>
        <div className="grid gap-12 lg:grid-cols-[1.15fr,1fr] lg:items-start">
          <div>
            <Eyebrow>Since 1999</Eyebrow>
            <h2 className="mt-4 text-2xl font-bold uppercase tracking-heading text-oxblood sm:text-3xl">
              We’ve been building commercial space in the Southeast since 1999.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-oxblood/70">
              We cut our teeth on national rollouts — 100+ Domino’s locations — where the schedule
              wasn’t a suggestion. That’s where we learned to mobilize fast, and it’s still how we
              run. Since then we’ve done tenant improvements, office buildouts, warehouse conversions,
              and restaurant renovations across Georgia, Tennessee, Alabama, and South Carolina.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-oxblood/70">
              Family-owned. Adam and Justin Upchurch run it. We self-perform non-specialty trades,
              which means when a job needs to start, it starts — we’re not waiting in line behind
              three subcontractors’ calendars.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-oxblood/70">
              Small enough that you’ll talk to the people actually running your job. Around long
              enough that we’ve seen most problems before they get expensive.
            </p>
          </div>
          <div>
            <div className="relative aspect-[4/3] overflow-hidden border-2 border-brass/30 bg-stone-100">
              <Image
                src={media.about.url}
                alt={media.about.alt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="mt-6 border-l-2 border-brass pl-4 text-lg italic leading-relaxed text-oxblood">
              A client’s condo caught fire on a Tuesday. We were weatherproofing the roof that
              afternoon. Sealed before the storm hit the next day. That’s not a special favor — it’s
              how we’re built.
            </p>
          </div>
        </div>
      </Section>

      {/* 5. Client logos */}
      <ClientLogoStrip />

      {/* 6. What we build */}
      <Section>
        <Eyebrow>What we build</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold uppercase tracking-heading text-oxblood">
          The kinds of space we build
        </h2>
        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {WHAT_WE_BUILD.map((item) => (
            <div key={item.title} className="border-t-2 border-brass/50 pt-4">
              <div className="text-lg font-bold uppercase tracking-heading text-oxblood">
                {item.title}
              </div>
              <p className="mt-2 text-oxblood/65">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-lg leading-relaxed text-oxblood/70">
          <span className="font-semibold text-oxblood">Our sweet spot: $50K–$500K commercial
          projects</span>{' '}
          in Metro Atlanta and across the Southeast. Under that, you’re better off with a handyman and
          we’ll tell you so. Over it, you probably want a firm with a project management department.
          Right in the middle is where we do our best work.
        </p>
        <Link
          href="/project-types"
          className="mt-6 inline-block text-[11px] font-bold uppercase tracking-label text-brass hover:underline"
        >
          See all project types →
        </Link>
      </Section>

      {/* 7. How it works */}
      <Section muted>
        <div className="max-w-3xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold uppercase tracking-heading text-oxblood">
            What it’s actually like to work with us
          </h2>
          <p className="mt-4 text-lg text-oxblood/65">
            The three-step version is up top. Here’s what’s underneath it.
          </p>
        </div>
        <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
          <div className="border-t-2 border-brass/50 pt-5">
            <h3 className="text-lg font-bold uppercase tracking-heading text-oxblood">
              What happens on the first call
            </h3>
            <p className="mt-3 leading-relaxed text-oxblood/70">
              We’ll ask about the space, your timeline, and what has to be true for this to be a win.
              It takes about ten minutes.
            </p>
            <p className="mt-3 leading-relaxed text-oxblood/70">
              If it’s a fit, we schedule a site visit that week. If it’s not — wrong size, wrong
              scope, wrong timing — we say so right then and point you toward someone better suited.
              You’re not going to spend three weeks finding out we were never the right call.
            </p>
          </div>
          <div className="border-t-2 border-brass/50 pt-5">
            <h3 className="text-lg font-bold uppercase tracking-heading text-oxblood">
              How we price it
            </h3>
            <p className="mt-3 leading-relaxed text-oxblood/70">
              We walk the space with you, document conditions, and take our own measurements. We
              don’t price off a drawing and hope.
            </p>
            <p className="mt-3 leading-relaxed text-oxblood/70">
              Then we build the estimate and get on a call to walk you through it. Every line. You’ll
              know what’s in there and what isn’t before you sign — not after the first change order
              shows up. If something on site turns out different than what we priced, you hear about
              it from us before it becomes a number on an invoice.
            </p>
          </div>
          <div className="border-t-2 border-brass/50 pt-5">
            <h3 className="text-lg font-bold uppercase tracking-heading text-oxblood">
              What you’ll see during construction
            </h3>
            <p className="mt-3 leading-relaxed text-oxblood/70">
              Weekly updates: what got done, what’s next, anything that changed.
            </p>
            <p className="mt-3 leading-relaxed text-oxblood/70">
              Plus live photo access through CompanyCam. Our crew uploads as they work, you pull it up
              whenever you want. No driving across town to find out whether the framing went in.
            </p>
          </div>
          <div className="border-t-2 border-brass/50 pt-5">
            <h3 className="text-lg font-bold uppercase tracking-heading text-oxblood">
              When something goes wrong
            </h3>
            <p className="mt-3 leading-relaxed text-oxblood/70">
              It will. Inspector fails something, a sub falls through, the building surprises us behind
              a wall.
            </p>
            <p className="mt-3 leading-relaxed text-oxblood/70">
              You’ll hear it from us the day it happens, with the fix and the schedule impact already
              worked out. The problem isn’t the problem. Finding out about it late is.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <CallButton phone={phone} phoneRaw={phoneRaw} label="Ready to start? Call us" />
        </div>
      </Section>

      {/* 8. Recent work */}
      {recent.length > 0 && (
        <Section>
          <div id="recent-work" className="scroll-mt-24">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl font-bold uppercase tracking-heading text-oxblood">Recent work</h2>
              <Link
                href="/projects"
                className="hidden text-[11px] font-bold uppercase tracking-label text-brass hover:underline sm:block"
              >
                See more projects →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
            <Link
              href="/projects"
              className="mt-8 inline-block text-[11px] font-bold uppercase tracking-label text-brass hover:underline sm:hidden"
            >
              See more projects →
            </Link>
          </div>
        </Section>
      )}

      {/* 8b. From the field — real jobsite photos */}
      {media.gallery.length > 0 && (
        <Section muted>
          <Eyebrow>From the field</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold uppercase tracking-heading text-oxblood">On the job</h2>
          <p className="mt-3 max-w-2xl text-oxblood/65">
            Raw, unstaged — shots from delivered commercial projects across Metro Atlanta.
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
      )}

      {/* 10. Stakes */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>What’s at stake</Eyebrow>
          <p className="mt-4 text-lg leading-relaxed text-oxblood/70">
            A blown timeline isn’t a scheduling problem. It’s a tenant paying rent on a space they
            can’t occupy, and a phone call you have to make.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-oxblood/70">
            A budget surprise isn’t a line item. It’s a conversation with your client or your investor
            where you don’t have a good answer.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-oxblood/70">
            And a GC who goes dark isn’t an inconvenience. It’s you doing his job on top of yours.
          </p>
          <p className="mt-6 text-lg font-semibold text-oxblood">
            In commercial construction, picking wrong gets measured in lost rent, lost trust, and time
            you don’t get back.
          </p>
        </div>
      </Section>

      {/* 11. Success */}
      <Section muted>
        <div className="max-w-3xl">
          <Eyebrow>When it goes right</Eyebrow>
          <p className="mt-4 text-2xl font-medium leading-snug text-oxblood sm:text-3xl">
            When it goes right, it’s boring.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-oxblood/70">
            The estimate is the invoice. The timeline holds. Calls get returned same day. The space
            opens on schedule, the tenant moves in, and nobody had to chase anybody.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-oxblood/70">
            Then the broker sends you the next one — because the last one was easy.
          </p>
          <p className="mt-6 text-lg font-semibold text-oxblood">That’s the job. Not flashy. Reliable.</p>
        </div>
      </Section>

      {/* 12. Closing CTA + form */}
      <section className="bg-oxblood py-24 text-bone sm:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="max-w-xl text-3xl font-bold uppercase tracking-heading text-bone sm:text-4xl">
              You’ve got a space that needs to be ready.
            </h2>
            <p className="mt-5 max-w-xl text-lg text-bone/60">
              We’ve been doing this since 1999. Call or fill out the form. We’ll get back to you within
              one business day — and if we’re not the right fit for your project, we’ll tell you that
              on the first call.
            </p>
            <div className="mt-8">
              <CallButton phone={phone} phoneRaw={phoneRaw} label="Call Mark Allan Contracting" className="btn-call-ondark" />
            </div>
          </div>

          <form
            className="space-y-4"
            action={`mailto:${email}`}
            method="post"
            encType="text/plain"
            data-lead-form
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-label text-brass">Name</span>
                <input name="name" type="text" required className={FORM_INPUT} />
              </label>
              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-label text-brass">Phone</span>
                <input name="phone" type="tel" className={FORM_INPUT} />
              </label>
            </div>
            <label className="block">
              <span className="text-[10px] font-medium uppercase tracking-label text-brass">Email</span>
              <input name="email" type="email" required className={FORM_INPUT} />
            </label>
            <label className="block">
              <span className="text-[10px] font-medium uppercase tracking-label text-brass">What’s the project?</span>
              <textarea name="project" rows={4} required className={FORM_INPUT} />
            </label>
            <button type="submit" className="btn-call-ondark w-full">
              Send it over
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

const FORM_INPUT =
  'mt-1 w-full border-2 border-brass/40 bg-bone px-3 py-2 text-oxblood placeholder:text-oxblood/40 focus:border-brass focus:outline-none';

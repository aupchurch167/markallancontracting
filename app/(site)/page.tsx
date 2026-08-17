import type { Metadata } from 'next';

// CMS edits (covers, text, photos) must appear immediately; the DB is only
// reachable at runtime, so render dynamically.
export const dynamic = 'force-dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { getAllProjectSummaries } from '@/lib/projects';
import { getHomepageMedia } from '@/lib/homepage-media';
import { telHref, CONTACT } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Commercial General Contractor in Metro Atlanta',
  description:
    'Commercial buildouts and renovations across Georgia, Tennessee, Alabama, and South Carolina. Family-owned since 1999. Get a real number, not a range.',
  path: '/',
});

const STEPS = [
  { n: '01', title: 'Call us.', body: "Five minutes. We'll tell you if we're a fit." },
  { n: '02', title: 'We walk the space.', body: 'Measurements, conditions, real estimate.' },
  { n: '03', title: 'We build.', body: 'One contact. Weekly updates. Photos from your phone.' },
];

const WHAT_WE_BUILD = [
  { title: 'Tenant improvements', body: 'Office buildouts, suite renovations, and space reconfigurations for new and existing tenants.' },
  { title: 'Restaurant & retail buildouts', body: 'Kitchen, dining, and storefront construction for restaurants, cafes, and retail concepts.' },
  { title: 'Warehouse & industrial conversions', body: 'Converting raw or underutilized warehouse space into functional commercial environments.' },
  { title: 'Office renovations', body: 'Modernizing dated offices with new layouts, finishes, and infrastructure.' },
  { title: 'Repairs & restoration', body: "Storm damage, structural repairs, roof work, water damage, and the calls that can't wait until next month." },
];

const HOW_IT_WORKS = [
  {
    title: 'What happens on the first call',
    paras: [
      "We'll ask about the space, your timeline, and what has to be true for this to be a win. It takes about ten minutes.",
      "If it's a fit, we schedule a site visit that week. If it's not — wrong size, wrong scope, wrong timing — we say so right then and point you toward someone better suited. You're not going to spend three weeks finding out we were never the right call.",
    ],
  },
  {
    title: 'How we price it',
    paras: [
      "We walk the space with you, document conditions, and take our own measurements. We don't price off a drawing and hope.",
      'Then we build the estimate and get on a call to walk you through it. Every line. You’ll know what’s in there and what isn’t before you sign — not after the first change order shows up.',
    ],
  },
  {
    title: "What you'll see during construction",
    paras: [
      'Weekly updates: what got done, what’s next, anything that changed.',
      'Plus live photo access through CompanyCam. Our crew uploads as they work, you pull it up whenever you want. No driving across town to find out whether the framing went in.',
    ],
  },
  {
    title: 'When something goes wrong',
    paras: [
      'It will. Inspector fails something, a sub falls through, the building surprises us behind a wall.',
      "You'll hear it from us the day it happens, with the fix and the schedule impact already worked out. The problem isn't the problem. Finding out about it late is.",
    ],
  },
];

const LOGOS = [
  { src: 'https://pub-afd6decbed4946b784c9e7c7bc462b18.r2.dev/covers/1a6cb7cd-b257-4fbd-ad41-096ee8819103-olive-garden-logo-wine.png', alt: 'Olive Garden', h: 38 },
  { src: 'https://pub-afd6decbed4946b784c9e7c7bc462b18.r2.dev/covers/5f291370-8cc4-47bc-8601-0afd72287c91-dominos-symbol.png', alt: "Domino's", h: 34 },
  { src: 'https://pub-afd6decbed4946b784c9e7c7bc462b18.r2.dev/covers/12ec0811-b807-4b59-acb0-74ae4cad9ecd-verizon-logo-png-1.png', alt: 'Verizon', h: 26 },
];

export default async function HomePage() {
  const settings = await getSiteSettings();
  const { phone, phoneRaw, email } = settings;
  const media = await getHomepageMedia();
  const summaries = await getAllProjectSummaries();
  const recent = summaries.slice(0, 3);

  return (
    <>
      {/* 1. HERO */}
      <div className="container-page pt-16">
        <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-[52px]">
          <div>
            <div className="kicker mb-5 text-maroon">General Contracting · Established 1999</div>
            <h1 className="font-display text-[15vw] leading-[0.92] sm:text-[68px] lg:text-[100px]">
              Your space,
              <br />
              open <span className="text-maroon">on time.</span>
            </h1>
            <p className="mt-6 max-w-[44ch] text-[20px] leading-relaxed text-body">
              Commercial buildouts and renovations across Georgia. Family-owned since 1999.
            </p>
            <div className="mb-12 mt-8 flex flex-wrap gap-3.5">
              <a href={telHref(phoneRaw)} data-tracked-phone className="btn-ink">
                Call us
              </a>
              <a href="#recent-work" className="btn-line">
                See recent work
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="relative h-[300px] sm:h-[430px]">
              <Image src={media.hero.url} alt={media.hero.alt} fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" priority />
            </div>
            <div className="max-w-[80%] bg-paper pr-5 pt-3.5">
              <p className="text-[14px] italic leading-relaxed text-muted">
                We self-perform non-specialty trades. That&apos;s why we don&apos;t wait on someone else&apos;s schedule to start yours.
              </p>
            </div>
          </div>
        </div>

        {/* 2. 3-STEP STRIP */}
        <div className="mt-10 grid border-t border-hairline sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className={`py-7 ${i < 2 ? 'sm:border-r sm:border-hairline sm:pr-8' : ''} ${i > 0 ? 'sm:pl-8' : ''}`}>
              <div className="font-display text-[34px] font-bold text-maroon">{s.n}</div>
              <div className="mt-1.5 text-[17px] font-semibold text-ink">{s.title}</div>
              <div className="mt-1 text-[15px] leading-relaxed text-muted">{s.body}</div>
            </div>
          ))}
        </div>
        <p className="pb-2 text-[14px] italic text-faint">On urgent work, we&apos;ve been on site the same day.</p>
      </div>

      {/* 3. THE HARD PART */}
      <section className="mt-14 bg-ink text-cream">
        <div className="container-page grid gap-14 py-20 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <div className="kicker mb-4 text-rose">The hard part</div>
            <h2 className="font-display text-[44px] leading-[0.95] text-cream sm:text-[54px]">You know how this usually goes.</h2>
          </div>
          <div className="flex flex-col gap-5 text-[18px] leading-[1.7] text-cream-muted">
            <p>The quote takes two weeks. Then the guy goes quiet. Then you&apos;re the one making calls, chasing updates, explaining to your tenant why the space isn&apos;t ready — apologizing for a mess you didn&apos;t make.</p>
            <p>Meanwhile the lease clock is running. Somebody&apos;s paying for square footage nobody can use.</p>
            <p className="font-medium text-cream">That&apos;s the bar in this industry. It&apos;s low. And it&apos;s why finding a GC you can actually rely on feels harder than it should.</p>
          </div>
        </div>
      </section>

      {/* 4. ABOUT / SINCE 1999 */}
      <div id="about" className="container-page pt-20">
        <div className="grid items-start gap-14 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="kicker mb-4 text-maroon">Since 1999</div>
            <h2 className="mb-6 font-display text-[40px] leading-[0.98] sm:text-[52px]">We&apos;ve been building commercial space in the Southeast since 1999.</h2>
            <div className="flex flex-col gap-4 text-[17px] leading-[1.65] text-body">
              <p>We cut our teeth on national rollouts — 100+ Domino&apos;s locations — where the schedule wasn&apos;t a suggestion. That&apos;s where we learned to mobilize fast, and it&apos;s still how we run. Since then we&apos;ve done tenant improvements, office buildouts, warehouse conversions, and restaurant renovations across Georgia, Tennessee, Alabama, and South Carolina.</p>
              <p>Family-owned. Adam and Justin Upchurch run it. We self-perform non-specialty trades, which means when a job needs to start, it starts — we&apos;re not waiting in line behind three subcontractors&apos; calendars.</p>
              <p>Small enough that you&apos;ll talk to the people actually running your job. Around long enough that we&apos;ve seen most problems before they get expensive.</p>
            </div>
          </div>
          <div>
            <div className="relative h-[380px]">
              <Image src={media.about.url} alt={media.about.alt} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
            </div>
            <div className="mt-5 border-l-2 border-maroon pl-5">
              <p className="text-[15px] leading-relaxed text-muted">
                A client&apos;s condo caught fire on a Tuesday. We were weatherproofing the roof that afternoon. Sealed before the storm hit the next day. That&apos;s not a special favor — it&apos;s how we&apos;re built.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. LOGO STRIP */}
      <div className="container-page mt-14">
        <div className="flex flex-wrap items-center gap-x-12 gap-y-4 border-y border-hairline py-6">
          <span className="whitespace-nowrap text-[13px] font-semibold uppercase tracking-label text-faint">Since 1999, we&apos;ve built for</span>
          <div className="flex flex-1 items-center justify-center gap-12">
            {LOGOS.map((l) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={l.alt} src={l.src} alt={l.alt} style={{ height: l.h }} className="opacity-65 grayscale" />
            ))}
          </div>
          <span className="max-w-[28ch] text-right text-[14px] text-faint">National brands. Local business. People who needed it done right the first time.</span>
        </div>
      </div>

      {/* 6. SERVICES */}
      <div id="services" className="container-page py-20">
        <div className="kicker mb-3.5 text-maroon">What we build</div>
        <h2 className="mb-9 font-display text-[40px] sm:text-[52px]">The kinds of space we build</h2>
        <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {WHAT_WE_BUILD.map((s) => (
            <div key={s.title} className="bg-paper p-7">
              <div className="mb-2 text-[18px] font-semibold text-ink">{s.title}</div>
              <div className="text-[15px] leading-relaxed text-muted">{s.body}</div>
            </div>
          ))}
          <div className="flex flex-col justify-between bg-maroon p-7 text-paper">
            <div className="text-[15px] leading-[1.6] text-paper/95">
              Our sweet spot: $50K–$500K commercial projects in Metro Atlanta and across the Southeast. Under that, you&apos;re better off with a handyman and we&apos;ll tell you so. Over it, you probably want a firm with a project management department. Right in the middle is where we do our best work.
            </div>
            <Link href="/project-types" className="mt-4 inline-block w-fit border-b-[1.5px] border-paper/50 font-semibold text-paper hover:border-paper">
              See all project types →
            </Link>
          </div>
        </div>
      </div>

      {/* 7. HOW IT WORKS */}
      <div id="process" className="container-page pb-20">
        <div className="kicker mb-3.5 text-maroon">How it works</div>
        <h2 className="mb-2.5 font-display text-[40px] sm:text-[52px]">What it&apos;s actually like to work with us</h2>
        <p className="mb-10 text-[16px] text-faint">The three-step version is up top. Here&apos;s what&apos;s underneath it.</p>
        <div className="grid gap-px border border-hairline bg-hairline lg:grid-cols-2">
          {HOW_IT_WORKS.map((b) => (
            <div key={b.title} className="bg-paper p-9">
              <h3 className="mb-3.5 font-display text-[26px] font-semibold text-ink">{b.title}</h3>
              <div className="flex flex-col gap-3 text-[15px] leading-[1.65] text-body">
                {b.paras.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-7">
          <a href={telHref(phoneRaw)} data-tracked-phone className="btn-ink">
            Ready to start? Call us
          </a>
        </div>
      </div>

      {/* 8. RECENT WORK */}
      <div id="recent-work" className="container-page pb-20">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-display text-[40px] sm:text-[52px]">Recent work</h2>
          <Link href="/projects" className="text-[16px] font-semibold text-maroon hover:text-maroon-light">
            See more projects →
          </Link>
        </div>
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((p) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className="group block">
              <div className="relative mb-4 h-[250px] overflow-hidden bg-paper-alt">
                {p.imageUrl && <Image src={p.imageUrl} alt={p.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />}
              </div>
              <div className="mb-1.5 text-[17px] font-semibold leading-snug text-ink transition-colors group-hover:text-maroon">{p.title}</div>
              {p.scopeSummary && <div className="text-[14px] leading-relaxed text-muted">{p.scopeSummary}</div>}
            </Link>
          ))}
        </div>
      </div>

      {/* 9. ON THE JOB GALLERY */}
      {media.gallery.length > 0 && (
        <div className="container-page pb-20">
          <div className="kicker mb-3.5 text-maroon">From the field</div>
          <div className="mb-8 flex items-baseline justify-between gap-6">
            <h2 className="font-display text-[40px] sm:text-[52px]">On the job</h2>
            <span className="hidden max-w-[36ch] text-right text-[15px] text-faint sm:block">Raw, unstaged — shots from delivered commercial projects across Metro Atlanta.</span>
          </div>
          <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] lg:grid-cols-4">
            {media.gallery.slice(0, 5).map((g, i) => (
              <div key={g.url} className={`relative overflow-hidden ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                <Image src={g.url} alt={g.alt} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. STAKES */}
      <section className="border-t border-hairline bg-paper-alt">
        <div className="container-page grid gap-16 py-20 lg:grid-cols-2">
          <div>
            <div className="kicker mb-4 text-maroon">What&apos;s at stake</div>
            <div className="flex flex-col gap-4 text-[17px] leading-[1.7] text-body">
              <p>A blown timeline isn&apos;t a scheduling problem. It&apos;s a tenant paying rent on a space they can&apos;t occupy, and a phone call you have to make.</p>
              <p>A budget surprise isn&apos;t a line item. It&apos;s a conversation with your client or your investor where you don&apos;t have a good answer.</p>
              <p>And a GC who goes dark isn&apos;t an inconvenience. It&apos;s you doing his job on top of yours.</p>
              <p className="font-medium text-ink">In commercial construction, picking wrong gets measured in lost rent, lost trust, and time you don&apos;t get back.</p>
            </div>
          </div>
          <div className="border-hairline lg:border-l lg:pl-16">
            <div className="kicker mb-4 text-maroon">When it goes right</div>
            <div className="flex flex-col gap-4 text-[17px] leading-[1.7] text-body">
              <p className="font-display text-[30px] font-semibold uppercase leading-[1.1] text-ink">When it goes right, it&apos;s boring.</p>
              <p>The estimate is the invoice. The timeline holds. Calls get returned same day. The space opens on schedule, the tenant moves in, and nobody had to chase anybody.</p>
              <p>Then the broker sends you the next one — because the last one was easy.</p>
              <p className="font-medium text-ink">That&apos;s the job. Not flashy. Reliable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. CTA + FORM */}
      <section className="bg-ink text-cream">
        <div className="container-page grid items-start gap-16 py-20 lg:grid-cols-[1.1fr_1fr] sm:py-24">
          <div>
            <h2 className="mb-5 font-display text-[48px] leading-[0.95] text-cream sm:text-[60px]">You&apos;ve got a space that needs to be ready.</h2>
            <p className="mb-8 max-w-[52ch] text-[17px] leading-[1.65] text-cream-muted">
              We&apos;ve been doing this since 1999. Call or fill out the form. We&apos;ll get back to you within one business day — and if we&apos;re not the right fit for your project, we&apos;ll tell you that on the first call.
            </p>
            <a href={telHref(phoneRaw)} data-tracked-phone className="btn-maroon-ondark">
              Call Mark Allan Contracting
            </a>
            <div className="mt-6 text-[15px] leading-[1.7] text-cream-muted">
              {phone} · {email}
              <br />
              {CONTACT.address.street}, {CONTACT.address.city}, {CONTACT.address.state} {CONTACT.address.zip}
            </div>
          </div>

          <form className="flex flex-col gap-4 border border-cream/10 bg-darkcard p-9" action={`mailto:${email}`} method="post" encType="text/plain" data-lead-form>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-cream-muted">Name</span>
                <input name="name" type="text" required className="rounded-[2px] border border-cream/15 bg-ink px-3.5 py-3 text-[15px] text-cream outline-none focus:border-rose" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-cream-muted">Phone</span>
                <input name="phone" type="tel" className="rounded-[2px] border border-cream/15 bg-ink px-3.5 py-3 text-[15px] text-cream outline-none focus:border-rose" />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-cream-muted">Email</span>
              <input name="email" type="email" required className="rounded-[2px] border border-cream/15 bg-ink px-3.5 py-3 text-[15px] text-cream outline-none focus:border-rose" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-cream-muted">What&apos;s the project?</span>
              <textarea name="project" rows={4} placeholder="Space, location, rough timeline" className="rounded-[2px] border border-cream/15 bg-ink px-3.5 py-3 text-[15px] text-cream outline-none placeholder:text-faint focus:border-rose" />
            </label>
            <button type="submit" className="rounded-[2px] bg-paper py-4 text-[16px] font-semibold text-ink transition-colors hover:bg-cream">
              Send it over
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

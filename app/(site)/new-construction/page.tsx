import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings, getPosts } from '@/lib/queries';
import { FALLBACK_POSTS } from '@/lib/fallback-insights';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Ground-Up Commercial Construction in Georgia — Where We Start',
  description:
    'Shell work, owner’s-side perspective, and pre-construction strength for ground-up commercial projects in Metro Atlanta. Honest scope, no overreach.',
  path: '/new-construction',
});

/**
 * CONTENT-LIMITED. Ground-up is a growth direction, not an established portfolio.
 * Lead with what is true (25+ years, national brands, self-performed trades,
 * owner's-side perspective). Do NOT claim ground-up portfolio depth or imply
 * scale MAC hasn't delivered. Pre-construction is the entry point; the ground-up
 * blog cluster does the credibility work.
 */
export default async function NewConstructionPage() {
  const { phone, phoneRaw } = await getSiteSettings();
  const posts = await getPosts();
  const sanityGroundUp = posts.filter((p) => p.cluster === 'ground-up');
  const sanitySlugs = new Set(sanityGroundUp.map((p) => p.slug));
  const groundUp = [
    ...sanityGroundUp,
    ...FALLBACK_POSTS.filter(
      (p) => p.cluster === 'ground-up' && !sanitySlugs.has(p.slug),
    ),
  ].slice(0, 3);

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'How We Build', path: '/how-we-build' },
          { name: 'New Construction', path: '/new-construction' },
        ]}
      />

      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Ground-up, from the owner&apos;s side
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            We&apos;ve spent 25 years building commercial interiors for national
            brands — and we&apos;ve been the owner developing and operating our own
            commercial property. That combination is what we bring to a ground-up
            conversation.
          </p>
        </div>
      </section>

      {/* What we take on today — honest scope and size */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>What we take on today</Eyebrow>
          <p className="mt-3 text-lg leading-relaxed text-stone-600">
            Our proof base is commercial interior work from {SITE.projectRange} —
            tenant improvements, restaurant and retail buildouts, office and
            warehouse conversions, self-performed across framing, drywall, paint,
            ceilings, and flooring. On the ground-up side we are strongest at shell
            work and at the pre-construction that gets a project to a real number
            before the first shovel. We will tell you plainly what fits that and what
            does not.
          </p>
        </div>
      </Section>

      {/* Why an owner would use a smaller GC — the real argument */}
      <Section muted>
        <div className="max-w-3xl">
          <Eyebrow>Why a smaller GC for ground-up</Eyebrow>
          <p className="mt-3 text-lg leading-relaxed text-stone-600">
            On a project this size, the people who priced it should be the people who
            build it — not a name on the contract who hands you to a team you never
            met. We&apos;ve carried the owner&apos;s risk ourselves, so we scope for
            what an owner actually worries about: the number holding, the schedule
            being real, and the trades performing. That is a different conversation
            than the one you get from a firm for whom your job is a rounding error.
          </p>
        </div>
      </Section>

      {/* Pre-construction as the entry point */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Where it starts</Eyebrow>
          <p className="mt-3 text-lg leading-relaxed text-stone-600">
            The right entry point for a ground-up conversation is pre-construction —
            budgeting, feasibility, and scope development before anything is locked.
            That is where we add the most value early, and where the decisions that
            set your budget actually get made.
          </p>
          <Link
            href="/pre-construction"
            className="mt-4 inline-block font-semibold text-accent hover:text-accent-700"
          >
            See what pre-construction covers →
          </Link>
        </div>
      </Section>

      {/* Ground-up blog cluster — doing the credibility work */}
      {groundUp.length > 0 && (
        <Section muted>
          <Eyebrow>Reading for owners and developers</Eyebrow>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {groundUp.map((p) => (
              <Link
                key={p.slug}
                href={`/insights/${p.slug}`}
                className="group rounded-lg border border-stone-200 bg-paper p-6 transition-colors hover:border-accent"
              >
                <div className="text-lg font-semibold text-navy group-hover:text-accent">
                  {p.title}
                </div>
                {p.excerpt && <p className="mt-2 text-sm text-stone-600">{p.excerpt}</p>}
              </Link>
            ))}
          </div>
        </Section>
      )}

      <CallCTA
        phone={phone}
        phoneRaw={phoneRaw}
        heading="Thinking about a ground-up project?"
        body="Call us early. Pre-construction is where we can help most."
      />
    </>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import { getSiteSettings, getTeam } from '@/lib/queries';
import { FALLBACK_TEAM } from '@/lib/fallback-team';
import { urlForImage } from '@/sanity/lib/image';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section } from '@/components/Section';
import { PortableText } from '@/components/PortableText';
import { SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Our Team — The People Who Build Your Job',
  description:
    'Meet the family-owned team at Mark Allan Contracting — the people who price your job, run the site, and answer the phone.',
  path: '/team',
});

interface Member {
  key: string;
  name: string;
  role: string;
  imageUrl?: string;
  email?: string;
  bioNodes?: React.ReactNode;
  bioText?: string;
}

export default async function TeamPage() {
  const [team, settings] = await Promise.all([getTeam(), getSiteSettings()]);
  const { phone, phoneRaw } = settings;

  // Sanity members win per-slug; the real fallback fills the rest.
  const sanitySlugs = new Set(team.map((m) => m.slug));
  const members: Member[] = [
    ...team.map((m) => ({
      key: m.slug || m._id,
      name: m.name,
      role: m.role,
      email: m.email,
      imageUrl: urlForImage(m.photo)?.width(600).height(600).url() || undefined,
      bioNodes: m.bio ? <PortableText value={m.bio} /> : undefined,
    })),
    ...FALLBACK_TEAM.filter((m) => !sanitySlugs.has(m.slug)).map((m) => ({
      key: m.slug,
      name: m.name,
      role: m.role,
      email: m.email,
      imageUrl: m.photo,
      bioText: m.bio,
    })),
  ];

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Team', path: '/team' },
        ]}
      />

      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            The people who build your job
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Family-owned since {SITE.established}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            The people who price your job stay on it through the build. Here&apos;s
            who you&apos;ll be working with.
          </p>
        </div>
      </section>

      <Section>
        {members.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2">
            {members.map((m) => (
              <div
                key={m.key}
                className="flex flex-col gap-5 rounded-xl border border-stone-200 bg-paper p-6 sm:flex-row"
              >
                <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  {m.imageUrl ? (
                    <Image
                      src={m.imageUrl}
                      alt={m.name}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-stone-400">
                      Photo
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy">{m.name}</h2>
                  <div className="text-sm font-semibold uppercase tracking-wide text-accent">
                    {m.role}
                  </div>
                  <div className="mt-3 text-stone-600">
                    {m.bioNodes ?? (m.bioText && <p className="leading-relaxed">{m.bioText}</p>)}
                  </div>
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="mt-3 inline-block text-sm font-semibold text-accent hover:text-accent-700">
                      {m.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-stone-500">Team profiles are on the way.</p>
        )}
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProject, getProjectSlugs, getSiteSettings } from '@/lib/queries';
import { urlForImage } from '@/sanity/lib/image';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { PortableText } from '@/components/PortableText';
import { pageMetadata } from '@/lib/seo';

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  const location =
    project.cityName && project.cityState
      ? ` in ${project.cityName}, ${project.cityState.toUpperCase()}`
      : '';
  return pageMetadata({
    title: `${project.title} — Project`,
    description:
      project.scopeSummary ||
      `${project.clientType || 'Commercial'} project${location} by Mark Allan Contracting.`,
    path: `/projects/${slug}`,
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { phone, phoneRaw } = await getSiteSettings();
  const location =
    project.cityName && project.cityState
      ? `${project.cityName}, ${project.cityState.toUpperCase()}`
      : undefined;
  const hero = urlForImage(project.images?.[0])?.width(1600).height(900).url();

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Projects', path: '/projects' },
          { name: project.title, path: `/projects/${slug}` },
        ]}
      />

      <section className="bg-navy text-white">
        <div className="container-page py-14 sm:py-16">
          <div className="flex flex-wrap items-center gap-2 text-sm text-stone-200/80">
            {project.clientType && <span>{project.clientType}</span>}
            {location && <span>· {location}</span>}
          </div>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {project.title}
          </h1>
        </div>
      </section>

      {hero && (
        <div className="relative aspect-video w-full bg-stone-200">
          <Image
            src={hero}
            alt={project.images?.[0]?.alt || project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <Section>
        <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            {project.challenge?.length ? (
              <div>
                <Eyebrow>The challenge</Eyebrow>
                <div className="mt-3 text-lg">
                  <PortableText value={project.challenge} />
                </div>
              </div>
            ) : null}
            {project.solution?.length ? (
              <div>
                <Eyebrow>What we did</Eyebrow>
                <div className="mt-3 text-lg">
                  <PortableText value={project.solution} />
                </div>
              </div>
            ) : null}
          </div>
          <aside className="space-y-4 rounded-lg border border-stone-200 bg-stone-50 p-6">
            {project.scopeSummary && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">Scope</div>
                <div className="mt-1 text-stone-600">{project.scopeSummary}</div>
              </div>
            )}
            {project.timeline && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">Timeline</div>
                <div className="mt-1 text-stone-600">{project.timeline}</div>
              </div>
            )}
            {location && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">Location</div>
                <div className="mt-1 text-stone-600">{location}</div>
              </div>
            )}
          </aside>
        </div>

        {/* Gallery */}
        {project.images && project.images.length > 1 && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.images.slice(1).map((image, i) => {
              const src = urlForImage(image)?.width(800).height(600).url();
              if (!src) return null;
              return (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone-100">
                  <Image
                    src={src}
                    alt={image.alt || `${project.title} — photo ${i + 2}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}

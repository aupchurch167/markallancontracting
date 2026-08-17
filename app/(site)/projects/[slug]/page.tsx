import type { Metadata } from 'next';

// Render dynamically: CMS edits (covers, text, photos) must appear immediately,
// and a CDN edge can't serve a stale page. The DB is only reachable at runtime.
export const dynamic = 'force-dynamic';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProject, getSiteSettings } from '@/lib/queries';
import { FALLBACK_PROJECTS_BY_SLUG } from '@/lib/fallback-projects';
import { urlForImage } from '@/lib/image';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { PortableText } from '@/components/PortableText';
import { MarkdownBody } from '@/components/MarkdownBody';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  const fb = FALLBACK_PROJECTS_BY_SLUG[slug];
  const title = project?.title || fb?.title;
  if (!title) return {};
  const location =
    project?.cityName && project?.cityState
      ? ` in ${project.cityName}, ${project.cityState.toUpperCase()}`
      : fb?.cityName
        ? ` in ${fb.cityName}, ${fb.cityState?.toUpperCase()}`
        : '';
  return pageMetadata({
    title: `${title} — Project`,
    description:
      project?.scopeSummary ||
      fb?.scopeSummary ||
      `${project?.clientType || fb?.clientType || 'Commercial'} project${location} by Mark Allan Contracting.`,
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
  const fb = FALLBACK_PROJECTS_BY_SLUG[slug];
  if (!project && !fb) notFound();

  const { phone, phoneRaw } = await getSiteSettings();

  const title = project?.title || fb!.title;
  const clientType = project?.clientType || fb?.clientType;
  const scopeSummary = project?.scopeSummary || fb?.scopeSummary;
  const timeline = project?.timeline || fb?.timeline;
  const cityName = project?.cityName || fb?.cityName;
  const cityState = project?.cityState || fb?.cityState;
  const location =
    cityName && cityState ? `${cityName}, ${cityState.toUpperCase()}` : undefined;
  const highlights = project?.highlights;
  const testimonial = project?.testimonial;
  const squareFootage = project?.squareFootage;
  const completed = project?.completedDate
    ? new Date(project.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : undefined;

  // Images: Sanity assets → CDN URLs, else R2 photo URLs, else fallback photos.
  const images: { url: string; alt: string }[] = project?.images?.length
    ? project.images
        .map((img, i) => ({
          url: urlForImage(img)?.width(1600).height(900).url() || '',
          alt: img.alt || `${title} — photo ${i + 1}`,
        }))
        .filter((x) => x.url)
    : project?.imageUrls?.length
      ? project.imageUrls
          .map((img, i) => ({ url: img.url, alt: img.alt || `${title} — photo ${i + 1}` }))
          .filter((x) => x.url)
      : fb?.images || [];

  // A dedicated cover photo (set in /admin) wins over the first gallery image.
  // When a cover exists, every gallery image shows below; otherwise the first
  // gallery image is promoted to the hero and the rest form the gallery.
  const coverUrl = project?.heroImageUrl;
  const hero = coverUrl ? { url: coverUrl, alt: title } : images[0];
  const galleryImages = coverUrl ? images : images.slice(1);

  // PDFs and other non-image source files attached to the project.
  const docs = (project?.attachments || []).filter(
    (a) => a.url && a.contentType !== undefined && !a.contentType.startsWith('image/'),
  );

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Projects', path: '/projects' },
          { name: title, path: `/projects/${slug}` },
        ]}
      />

      <section className="bg-ink text-white">
        <div className="container-page py-14 sm:py-16">
          <div className="flex flex-wrap items-center gap-2 text-sm text-cream-muted">
            {clientType && <span>{clientType}</span>}
            {location && <span>· {location}</span>}
          </div>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
        </div>
      </section>

      {hero && (
        <div className="relative aspect-video w-full bg-paper-alt">
          <Image src={hero.url} alt={hero.alt} fill priority sizes="100vw" className="object-cover" />
        </div>
      )}

      {/* Highlights stat row */}
      {highlights && highlights.length > 0 && (
        <div className="border-b border-hairline bg-paper">
          <div className="container-page grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
            {highlights.map((h) => (
              <div key={h.label}>
                <div className="text-2xl font-bold text-ink sm:text-3xl">{h.value}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-faint">{h.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Section>
        <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            {project?.bodyMarkdown ? (
              <div className="text-lg">
                <MarkdownBody>{project.bodyMarkdown}</MarkdownBody>
              </div>
            ) : (
              <>
                {project?.challenge?.length || fb?.challenge?.length ? (
                  <div>
                    <Eyebrow>The challenge</Eyebrow>
                    <div className="mt-3 text-lg">
                      {project?.challenge?.length ? (
                        <PortableText value={project.challenge} />
                      ) : (
                        fb?.challenge.map((p, i) => (
                          <p key={i} className="mb-4 leading-relaxed text-body">{p}</p>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
                {project?.solution?.length || fb?.solution?.length ? (
                  <div>
                    <Eyebrow>What we did</Eyebrow>
                    <div className="mt-3 text-lg">
                      {project?.solution?.length ? (
                        <PortableText value={project.solution} />
                      ) : (
                        fb?.solution.map((p, i) => (
                          <p key={i} className="mb-4 leading-relaxed text-body">{p}</p>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
          <aside className="space-y-4 rounded-[2px] border border-hairline bg-paper p-6">
            {scopeSummary && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-faint">Scope</div>
                <div className="mt-1 text-body">{scopeSummary}</div>
              </div>
            )}
            {timeline && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-faint">Timeline</div>
                <div className="mt-1 text-body">{timeline}</div>
              </div>
            )}
            {location && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-faint">Location</div>
                <div className="mt-1 text-body">{location}</div>
              </div>
            )}
            {squareFootage && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-faint">Size</div>
                <div className="mt-1 text-body">{squareFootage}</div>
              </div>
            )}
            {completed && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-faint">Completed</div>
                <div className="mt-1 text-body">{completed}</div>
              </div>
            )}
          </aside>
        </div>

        {/* Testimonial */}
        {testimonial?.quote && (
          <figure className="mt-12 rounded-[2px] border-l-4 border-maroon bg-paper p-8">
            <blockquote className="text-xl font-medium leading-relaxed text-ink">
              “{testimonial.quote}”
            </blockquote>
            {(testimonial.attribution || testimonial.role) && (
              <figcaption className="mt-4 text-sm text-muted">
                {testimonial.attribution && (
                  <span className="font-semibold text-ink">{testimonial.attribution}</span>
                )}
                {testimonial.role && <span> · {testimonial.role}</span>}
              </figcaption>
            )}
          </figure>
        )}

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((image, i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-paper-alt">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Attachments (PDFs, spec sheets) */}
        {docs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-faint">
              Documents
            </h2>
            <ul className="mt-3 space-y-2">
              {docs.map((doc, i) => (
                <li key={i}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-ink hover:text-maroon"
                  >
                    <span aria-hidden="true">📄</span>
                    {doc.label || `Document ${i + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}

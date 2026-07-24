import type { Metadata } from 'next';
import { getProjects, getSiteSettings } from '@/lib/queries';
import { CallCTA } from '@/components/CallCTA';
import { ProjectCard } from '@/components/ProjectCard';
import { Section } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Projects — Delivered Commercial Buildouts',
  description:
    'Delivered commercial buildouts and renovations across the Southeast. Tenant improvements, restaurant and retail, office, and warehouse work.',
  path: '/projects',
});

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()]);
  const { phone, phoneRaw } = settings;

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-bold text-white sm:text-5xl">Projects</h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            Delivered work — not renderings. Every project here is finished and
            occupied.
          </p>
        </div>
      </section>

      <Section>
        {projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-10 text-center text-stone-500">
            Project case studies are being loaded from CompanyCam. Call us and
            we&apos;ll walk you through delivered work in your market.
          </div>
        )}
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}

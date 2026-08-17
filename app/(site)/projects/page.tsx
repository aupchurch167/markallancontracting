import type { Metadata } from 'next';

// CMS edits must appear immediately; the DB is only reachable at runtime.
export const dynamic = 'force-dynamic';
import { getSiteSettings } from '@/lib/queries';
import { getAllProjectSummaries } from '@/lib/projects';
import { EditorialCTA } from '@/components/EditorialCTA';
import { ProjectsGrid } from './ProjectsGrid';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Projects — Delivered Commercial Buildouts',
  description:
    'Delivered commercial buildouts and renovations across the Southeast. Tenant improvements, restaurant and retail, office, and warehouse work.',
  path: '/projects',
});

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([getAllProjectSummaries(), getSiteSettings()]);
  const { phone, phoneRaw, email } = settings;

  return (
    <>
      <div className="container-page pt-16 sm:pt-[72px]">
        <div className="kicker mb-5 text-maroon">Delivered work · $50K–$500K</div>
        <div className="mb-9 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <h1 className="font-display text-[15vw] leading-[0.92] sm:text-[72px] lg:text-[88px]">Projects</h1>
          <p className="max-w-[46ch] text-[17px] leading-relaxed text-muted lg:mb-2">
            Tenant improvements, buildouts, conversions, and repairs across Georgia, Tennessee, Alabama, and South Carolina.
          </p>
        </div>
      </div>

      {projects.length > 0 ? (
        <ProjectsGrid projects={projects} />
      ) : (
        <div className="container-page pb-20">
          <div className="border border-dashed border-hairline bg-paper-alt p-10 text-center text-muted">
            Project case studies are being loaded from CompanyCam. Call us and we&apos;ll walk you through delivered work in your market.
          </div>
        </div>
      )}

      <EditorialCTA phone={phone} phoneRaw={phoneRaw} email={email} />
    </>
  );
}

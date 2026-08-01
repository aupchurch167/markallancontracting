import Link from 'next/link';
import Image from 'next/image';
import type { ProjectSummary } from '@/lib/projects';

/** Portfolio card: photo, client type, location, scope one-liner. */
export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block border-2 border-brass/40 bg-bone transition-colors hover:border-brass"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-400">
            Project photo
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-label text-brass">
          {project.clientType && <span>{project.clientType}</span>}
          {project.location && <span>· {project.location}</span>}
        </div>
        <div className="mt-2 text-base font-bold uppercase tracking-heading text-oxblood group-hover:text-brass">
          {project.title}
        </div>
        {project.scopeSummary && (
          <p className="mt-2 line-clamp-2 text-sm text-oxblood/65">{project.scopeSummary}</p>
        )}
      </div>
    </Link>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import type { ProjectSummary } from '@/lib/projects';

/** Portfolio card: photo, client type, location, scope one-liner. */
export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group overflow-hidden rounded-lg border border-stone-200 bg-paper transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-stone-100">
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
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-400">
          {project.clientType && <span>{project.clientType}</span>}
          {project.location && <span>· {project.location}</span>}
        </div>
        <div className="mt-1 text-lg font-semibold text-navy group-hover:text-accent">
          {project.title}
        </div>
        {project.scopeSummary && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-600">{project.scopeSummary}</p>
        )}
      </div>
    </Link>
  );
}

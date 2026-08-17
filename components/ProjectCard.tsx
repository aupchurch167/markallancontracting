import Link from 'next/link';
import Image from 'next/image';
import type { ProjectSummary } from '@/lib/projects';

/** Portfolio card: photo, client type, location, scope one-liner. */
export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block border-2 border-hairline bg-paper transition-colors hover:border-hairline"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-alt">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-faint">
            Project photo
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-label text-maroon">
          {project.clientType && <span>{project.clientType}</span>}
          {project.location && <span>· {project.location}</span>}
        </div>
        <div className="mt-2 text-base font-bold uppercase tracking-heading text-ink group-hover:text-maroon">
          {project.title}
        </div>
        {project.scopeSummary && (
          <p className="mt-2 line-clamp-2 text-sm text-body">{project.scopeSummary}</p>
        )}
        {project.quote && (
          <p className="mt-4 border-l-2 border-hairline pl-3.5 text-sm italic leading-snug text-ink">
            “{project.quote}”
          </p>
        )}
      </div>
    </Link>
  );
}

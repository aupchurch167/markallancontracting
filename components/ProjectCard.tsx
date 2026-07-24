import Link from 'next/link';
import Image from 'next/image';
import { urlForImage } from '@/sanity/lib/image';
import type { ProjectCard as ProjectCardType } from '@/lib/types';

/** Portfolio card: photo, client type, location, scope one-liner. */
export function ProjectCard({ project }: { project: ProjectCardType }) {
  const img = urlForImage(project.image)?.width(800).height(600).url();
  const location =
    project.cityName && project.cityState
      ? `${project.cityName}, ${project.cityState.toUpperCase()}`
      : undefined;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group overflow-hidden rounded-lg border border-stone-200 bg-paper transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-stone-100">
        {img ? (
          <Image
            src={img}
            alt={project.image?.alt || project.title}
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
          {location && <span>· {location}</span>}
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

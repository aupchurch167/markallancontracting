import { telHref } from '@/lib/constants';

/**
 * Ink CTA band used at the foot of inner pages (Projects, Insights, article).
 * H2 left, maroon call button + contact line right.
 */
export function EditorialCTA({
  phone,
  phoneRaw,
  email,
  heading = "You've got a space that needs to be ready.",
}: {
  phone: string;
  phoneRaw: string;
  email: string;
  heading?: string;
}) {
  return (
    <section className="bg-ink text-cream">
      <div className="container-page flex flex-col items-start justify-between gap-8 py-16 sm:py-20 lg:flex-row lg:items-center">
        <h2 className="max-w-[20ch] font-display text-[40px] leading-[0.95] text-cream sm:text-[48px]">{heading}</h2>
        <div className="flex flex-none flex-col items-start gap-3">
          <a href={telHref(phoneRaw)} data-tracked-phone className="btn-maroon-ondark">
            Call Mark Allan Contracting
          </a>
          <span className="text-[14px] text-cream-muted">
            {phone} · {email}
          </span>
        </div>
      </div>
    </section>
  );
}

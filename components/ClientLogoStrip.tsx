import { getClientLogos } from '@/lib/content';

/**
 * "Who we've worked with" — a restrained strip of client logos, managed in
 * /admin. Renders nothing until at least one logo is added, so the home page
 * never shows an empty band. Flat, on-system: hairline rules, uniform logo height.
 */
export async function ClientLogoStrip() {
  const logos = await getClientLogos();
  if (logos.length === 0) return null;

  return (
    <section className="border-y-2 border-hairline bg-paper-alt">
      <div className="container-page py-14">
        <div className="eyebrow">Since 1999, we&apos;ve built for</div>
        <div className="mt-8 flex flex-wrap items-center gap-x-12 gap-y-8">
          {logos.map((logo, i) => (
            <div key={`${logo.url}-${i}`} className="flex h-10 items-center sm:h-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.url}
                alt={logo.name || 'Client logo'}
                loading="lazy"
                className="max-h-full w-auto object-contain"
              />
            </div>
          ))}
        </div>
        <p className="mt-8 text-body">
          National brands. Local business. People who needed it done right the first time.
        </p>
      </div>
    </section>
  );
}

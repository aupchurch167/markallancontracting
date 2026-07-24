import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getLandingPage, getSiteSettings } from '@/lib/queries';
import { urlForImage } from '@/sanity/lib/image';
import { LP_CONTENT, LP_SLUGS } from '@/lib/fallback-lp';
import { CallButton } from '@/components/PhoneLink';
import { PortableText } from '@/components/PortableText';
import { SITE } from '@/lib/constants';

export function generateStaticParams() {
  // Pre-generate the known initial slugs; Sanity-authored slugs render on demand.
  return LP_SLUGS.map((slug) => ({ slug }));
}
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getLandingPage(slug);
  const fallback = LP_CONTENT[slug];
  const headline = doc?.headline || fallback?.headline;
  if (!headline) return {};
  return {
    title: `${headline} · ${SITE.name}`,
    description: doc?.subhead || fallback?.subhead,
    // Campaign pages are always noindex,nofollow and excluded from the sitemap.
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE.url}/lp/${slug}` },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [doc, settings] = await Promise.all([getLandingPage(slug), getSiteSettings()]);
  const fallback = LP_CONTENT[slug];
  if (!doc && !fallback) notFound();

  const { phone, phoneRaw } = settings;
  const headline = doc?.headline || fallback.headline;
  const subhead = doc?.subhead || fallback?.subhead;
  const plan =
    doc?.planSteps?.length
      ? doc.planSteps.map((s) => s.title)
      : fallback?.plan || [];
  const ctaLabel = doc?.ctaText;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-16">
      {/* Minimal wordmark — no nav */}
      <div className="text-sm font-bold uppercase tracking-wider text-navy">
        {SITE.name}
      </div>

      {/* Headline */}
      <h1 className="mt-6 text-4xl font-bold text-navy sm:text-5xl">{headline}</h1>
      {subhead && <p className="mt-4 text-lg text-stone-600">{subhead}</p>}

      {/* Two-sentence problem */}
      <div className="mt-6 text-lg text-stone-600">
        {doc?.problemCopy?.length ? (
          <PortableText value={doc.problemCopy} />
        ) : (
          <p>{fallback?.problem}</p>
        )}
      </div>

      {/* Three-step plan */}
      {plan.length > 0 && (
        <ol className="mt-8 space-y-2">
          {plan.map((step, i) => (
            <li key={i} className="flex items-center gap-3 text-navy">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="font-medium">{step}</span>
            </li>
          ))}
        </ol>
      )}

      {/* Single CTA — phone */}
      <div className="mt-10">
        <CallButton
          phone={phone}
          phoneRaw={phoneRaw}
          className="btn-call w-full text-lg sm:w-auto"
          label={ctaLabel}
        />
      </div>

      {/* Minimal proof */}
      {doc?.proofLogos?.length ? (
        <div className="mt-10 flex flex-wrap items-center gap-6 opacity-80">
          {doc.proofLogos.map((logo, i) => {
            const src = urlForImage(logo)?.width(160).url();
            return src ? (
              <Image key={i} src={src} alt="" width={120} height={48} className="h-10 w-auto object-contain" />
            ) : null;
          })}
        </div>
      ) : fallback?.proofLine ? (
        <p className="mt-10 text-sm font-medium text-stone-400">{fallback.proofLine}</p>
      ) : null}
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { FALLBACK_CITIES } from '@/lib/fallback-cities';
import { getSiteSettings } from '@/lib/queries';
import { CallCTA } from '@/components/CallCTA';
import { Section } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Commercial General Contractor Locations in Metro Atlanta',
  description:
    'City and county pages for commercial interiors in Metro Atlanta: Atlanta, Alpharetta, Marietta, Duluth, Sandy Springs, Buford, Gwinnett County, and Cobb County.',
  path: '/locations',
});

/**
 * One line each, taken from that city page's existing intro. Nothing here
 * adds a claim that page does not already make.
 */
const BLURB: Record<string, string> = {
  'atlanta-ga':
    'Family-owned commercial general contractor in Atlanta since 1999. Tenant improvements, restaurant and retail buildouts, office renovations, warehouse conversions — typically $50K–$500K.',
  'alpharetta-ga':
    'Commercial interiors across Alpharetta — office, retail, restaurant, and tenant improvements.',
  'marietta-ga':
    'Commercial interiors across Marietta and Cobb County — tenant improvements, office, retail, and restaurant work.',
  'duluth-ga':
    'Commercial interiors across Duluth and Gwinnett County — restaurant, retail, office, and tenant improvement work.',
  'sandy-springs-ga':
    'Commercial interiors across Sandy Springs — office renovation, tenant improvements, and retail work.',
  'buford-ga':
    'Commercial interiors across Buford — warehouse conversion, restaurant, and tenant improvement work.',
  'gwinnett-ga':
    'Commercial interiors across Gwinnett County — warehouse conversion, restaurant, retail, office, and tenant improvement work.',
  'cobb-ga':
    'Commercial interiors across Cobb County — warehouse conversion, office, retail, and tenant improvement work.',
};

export default async function LocationsHub() {
  const { phone, phoneRaw } = await getSiteSettings();

  return (
    <>
      <section className="bg-ink text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-maroon">
            Locations
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Where we work
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream-muted">
            City and county pages across Metro Atlanta.
          </p>
        </div>
      </section>

      <Section>
        <ul className="divide-y divide-hairline border border-hairline bg-paper">
          {FALLBACK_CITIES.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/locations/${city.slug}`}
                className="block px-6 py-5 transition-colors hover:bg-[#FFFFFF] sm:px-7"
              >
                <div className="text-lg font-bold text-ink">
                  {city.name}, {city.state.toUpperCase()}
                </div>
                <p className="mt-1 text-body">{BLURB[city.slug]}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { SITE, CONTACT } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Use',
  description: `The terms that govern your use of ${SITE.url}.`,
  path: '/terms',
});

const EFFECTIVE = 'July 25, 2026';

export default function TermsPage() {
  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-page py-14 sm:py-16">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Terms of Use</h1>
          <p className="mt-3 text-stone-100/80">Effective {EFFECTIVE}</p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-prose space-y-6 text-stone-600">
          <p>
            These Terms govern your use of {SITE.url}, operated by {SITE.name}. By using
            the site, you agree to these Terms. If you do not agree, please do not use
            the site.
          </p>

          <h2 className="text-xl font-bold text-navy">Use of the site</h2>
          <p>
            You may use the site for lawful purposes only. You agree not to misuse the
            site, interfere with its operation, or attempt to access it in any way other
            than through the interface we provide.
          </p>

          <h2 className="text-xl font-bold text-navy">No professional reliance</h2>
          <p>
            Content on the site — including project ranges, timelines, and process
            descriptions — is general information, not a quote, contract, or professional
            advice for your specific project. Any estimate or scope is provided
            separately and in writing.
          </p>

          <h2 className="text-xl font-bold text-navy">Intellectual property</h2>
          <p>
            The site and its content, marks, and project photography are owned by{' '}
            {SITE.name} or its licensors and may not be copied or used without permission.
          </p>

          <h2 className="text-xl font-bold text-navy">Disclaimer & limitation of liability</h2>
          <p>
            The site is provided “as is,” without warranties of any kind. To the fullest
            extent permitted by law, {SITE.name} is not liable for any damages arising
            from your use of the site.
          </p>

          <h2 className="text-xl font-bold text-navy">Governing law</h2>
          <p>These Terms are governed by the laws of the State of Georgia, without regard to its conflict-of-laws rules.</p>

          <h2 className="text-xl font-bold text-navy">Changes</h2>
          <p>We may update these Terms from time to time. The effective date above reflects the latest version.</p>

          <h2 className="text-xl font-bold text-navy">Contact</h2>
          <p>
            Questions about these Terms? Reach us at{' '}
            <a href={`mailto:${CONTACT.email}`} className="text-accent hover:text-accent-700">{CONTACT.email}</a>{' '}
            or <a href={`tel:${CONTACT.phoneRaw}`} className="text-accent hover:text-accent-700">{CONTACT.phone}</a>.
          </p>

          <p className="text-sm text-stone-400">
            See also our{' '}
            <Link href="/privacy" className="text-accent hover:text-accent-700">Privacy Policy</Link>.
          </p>
        </div>
      </Section>
    </>
  );
}

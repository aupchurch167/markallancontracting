import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { SITE, CONTACT } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: `How ${SITE.name} collects, uses, and protects information on macont.com.`,
  path: '/privacy',
});

const EFFECTIVE = 'July 25, 2026';

export default function PrivacyPage() {
  const addr = CONTACT.address;
  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-page py-14 sm:py-16">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-stone-100/80">Effective {EFFECTIVE}</p>
        </div>
      </section>

      <Section>
        <div className="prose-legal mx-auto max-w-prose space-y-6 text-stone-600">
          <p>
            {SITE.name} (“we,” “us”) operates {SITE.url}. This policy explains what
            information we collect through the site, how we use it, and the choices
            you have. By using the site you agree to this policy.
          </p>

          <h2 className="text-xl font-bold text-navy">Information we collect</h2>
          <p>
            <strong className="font-semibold text-navy">Information you give us.</strong>{' '}
            When you contact us or submit a project scope, we collect the details you
            provide — typically your name, email, phone number, and information about
            your project or space.
          </p>
          <p>
            <strong className="font-semibold text-navy">Call information.</strong> Phone
            numbers on the site are dynamically inserted and tracked through CallRail
            so we can understand how callers found us. Calls may be recorded or their
            metadata logged. See CallRail’s privacy policy for details.
          </p>
          <p>
            <strong className="font-semibold text-navy">Usage information.</strong> Like
            most websites, we automatically collect standard analytics data (pages
            viewed, referring source, approximate location, device and browser)
            through Google Analytics 4 and similar tools, using cookies and comparable
            technologies.
          </p>

          <h2 className="text-xl font-bold text-navy">How we use information</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>To respond to your inquiry and provide estimates and services;</li>
            <li>To understand which pages and campaigns drive contact, and improve the site;</li>
            <li>To operate, secure, and maintain the site;</li>
            <li>To comply with legal obligations.</li>
          </ul>

          <h2 className="text-xl font-bold text-navy">Cookies & tracking</h2>
          <p>
            We use cookies and similar technologies for analytics and call
            attribution. You can control cookies through your browser settings, and
            you can opt out of Google Analytics using Google’s browser add-on.
            Disabling cookies may affect how the site functions.
          </p>

          <h2 className="text-xl font-bold text-navy">How we share information</h2>
          <p>
            We do not sell your personal information. We share it only with service
            providers that help us operate the site and follow up on inquiries — such
            as Google (Analytics), CallRail (call tracking), and our hosting and email
            providers — and when required by law.
          </p>

          <h2 className="text-xl font-bold text-navy">Data retention & security</h2>
          <p>
            We keep information only as long as needed for the purposes above or as
            required by law, and we use reasonable measures to protect it. No method of
            transmission or storage is completely secure.
          </p>

          <h2 className="text-xl font-bold text-navy">Your choices</h2>
          <p>
            You may ask us to access, correct, or delete the personal information you
            have provided by contacting us. Depending on where you live, you may have
            additional rights under applicable privacy law.
          </p>

          <h2 className="text-xl font-bold text-navy">Children’s privacy</h2>
          <p>The site is not directed to children under 13, and we do not knowingly collect their information.</p>

          <h2 className="text-xl font-bold text-navy">Changes</h2>
          <p>We may update this policy from time to time. The effective date above reflects the latest version.</p>

          <h2 className="text-xl font-bold text-navy">Contact us</h2>
          <p>
            {SITE.name}<br />
            {addr.street}, {addr.city}, {addr.state} {addr.zip}<br />
            <a href={`mailto:${CONTACT.email}`} className="text-accent hover:text-accent-700">{CONTACT.email}</a>{' '}
            · <a href={`tel:${CONTACT.phoneRaw}`} className="text-accent hover:text-accent-700">{CONTACT.phone}</a>
          </p>

          <p className="text-sm text-stone-400">
            See also our{' '}
            <Link href="/terms" className="text-accent hover:text-accent-700">Terms of Use</Link>.
          </p>
        </div>
      </Section>
    </>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { CallRail } from '@/components/CallRail';
import { Analytics } from '@/components/Analytics';
import { ConversionTracking } from '@/components/ConversionTracking';
import { JsonLd } from '@/components/JsonLd';
import { getSiteSettings } from '@/lib/queries';
import { localBusinessSchema } from '@/lib/schema';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Commercial General Contractor, Metro Atlanta`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.oneLiner,
  alternates: {
    types: { 'application/rss+xml': `${SITE.url}/feed.xml` },
  },
};

/**
 * Root layout is intentionally chrome-free: html/body + sitewide tracking and
 * schema only. Header/footer live in the (site) route group so the /lp/*
 * campaign pages can render a locked, nav-free layout while still getting
 * CallRail DNI before first paint.
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="en">
      <head>
        <CallRail
          callRailId={settings.callRailId}
          resource={settings.callRailResource}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <JsonLd data={localBusinessSchema({ phone: settings.phone, email: settings.email })} />
        {children}
        <Analytics ga4Id={settings.ga4Id} />
        <ConversionTracking />
      </body>
    </html>
  );
}

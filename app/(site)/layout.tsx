import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getSiteSettings } from '@/lib/queries';

/** Chrome for the indexed marketing site: persistent header CTA + NAP footer. */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  return (
    <>
      <Header phone={settings.phone} phoneRaw={settings.phoneRaw} />
      <main className="flex-1">{children}</main>
      <Footer
        phone={settings.phone}
        phoneRaw={settings.phoneRaw}
        email={settings.email}
        settings={settings.raw}
      />
    </>
  );
}

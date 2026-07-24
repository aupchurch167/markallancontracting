import Script from 'next/script';

/** GA4. Renders nothing until {{GA4_ID}} is supplied (open item). */
export function Analytics({ ga4Id }: { ga4Id: string }) {
  if (!ga4Id) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4Id}');
        `}
      </Script>
    </>
  );
}

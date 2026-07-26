import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Branded Open Graph image. Every page defaults its social card to
 * /api/og?title=…&eyebrow=… (see lib/seo.ts), so shares look designed instead of
 * blank. 1200×630, navy on the brand palette.
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'Commercial General Contractor').slice(0, 120);
  const eyebrow = (searchParams.get('eyebrow') || 'Metro Atlanta · Since 1999').slice(0, 60);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#1B3A5C',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 40, height: 6, backgroundColor: '#2E75B6', marginRight: 20 }} />
          <div style={{ color: 'white', fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>
            MARK ALLAN CONTRACTING
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#7FB0DE', fontSize: 28, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
            {eyebrow}
          </div>
          <div style={{ color: 'white', fontSize: 66, fontWeight: 800, lineHeight: 1.05, maxWidth: 960 }}>
            {title}
          </div>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 24 }}>
          Commercial buildouts across GA · TN · AL · SC · Projects from $50K to $500K
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

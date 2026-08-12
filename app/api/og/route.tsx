import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Branded Open Graph image. Every page defaults its social card to
 * /api/og?title=…&eyebrow=… (see lib/seo.ts), so shares look designed instead of
 * blank. 1200×630, in the print-system palette (oxblood / bone / brass).
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'Commercial General Contractor').slice(0, 120);
  const eyebrow = (searchParams.get('eyebrow') || 'Metro Atlanta · Since 1999').slice(0, 60);

  const OXBLOOD = '#5A2634';
  const BONE = '#E8E1D5';
  const BRASS = '#A98B62';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: OXBLOOD,
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 44, height: 6, backgroundColor: BRASS, marginRight: 20 }} />
          <div style={{ color: BONE, fontSize: 26, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            Mark Allan Contracting
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: BRASS, fontSize: 26, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 18 }}>
            {eyebrow}
          </div>
          <div style={{ color: BONE, fontSize: 66, fontWeight: 800, lineHeight: 1.08, letterSpacing: 1, maxWidth: 980, textTransform: 'uppercase' }}>
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(232,225,213,0.7)', fontSize: 23 }}>
          <div style={{ width: 44, height: 2, backgroundColor: BRASS, marginRight: 16 }} />
          Commercial buildouts across GA · TN · AL · SC · Projects from $50K to $500K
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

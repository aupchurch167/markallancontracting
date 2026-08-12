import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';

/** PWA / "add to home screen" manifest. Brand palette (oxblood ground). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.oneLiner,
    start_url: '/',
    display: 'browser',
    background_color: '#E8E1D5',
    theme_color: '#5A2634',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}

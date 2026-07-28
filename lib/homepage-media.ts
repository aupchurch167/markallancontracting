import { client } from '@/sanity/lib/client';

/** One image slot on the home page. */
export interface MediaSlot {
  url: string;
  alt: string;
}

export interface HomepageMedia {
  hero: MediaSlot;
  about: MediaSlot;
  gallery: MediaSlot[];
}

/**
 * The photos the home page ships with. These render until the `homepage`
 * singleton is edited from /admin, and are the source of truth the admin
 * console shows as the current state before the first save.
 */
export const HOMEPAGE_FALLBACK: HomepageMedia = {
  hero: {
    url: '/projects/kennesaw-pilates-studio/4.jpg',
    alt: 'Completed Pilates studio buildout in Kennesaw, Georgia',
  },
  about: {
    url: '/projects/paint-12-buildings/1.jpg',
    alt: 'Exterior repaint across a 12-building commercial property',
  },
  gallery: [
    {
      url: '/projects/kennesaw-pilates-studio/2.jpg',
      alt: 'Pilates studio buildout — open workout floor, Kennesaw, GA',
    },
    {
      url: '/projects/kennesaw-pilates-studio/3.jpg',
      alt: 'Interior finish work on a Pilates studio buildout',
    },
    {
      url: '/projects/tanning-salon-buildout/2.jpg',
      alt: 'Tanning salon buildout — interior finishes',
    },
    {
      url: '/projects/tanning-salon-buildout/3.jpg',
      alt: 'Tanning salon buildout — tenant space',
    },
    {
      url: '/projects/tanning-salon-buildout/4.jpg',
      alt: 'Tanning salon buildout — completed interior',
    },
  ],
};

function slot(v: { url?: string; alt?: string } | undefined, fallback: MediaSlot): MediaSlot {
  return v?.url ? { url: v.url, alt: v.alt || fallback.alt } : fallback;
}

/**
 * Home page media: the Sanity `homepage` singleton (edited from /admin) wins,
 * with the shipped fallback filling any empty slot. Safe before Sanity exists.
 */
export async function getHomepageMedia(): Promise<HomepageMedia> {
  if (!client) return HOMEPAGE_FALLBACK;
  // Read from the API (not the CDN) so a just-saved change is reflected the
  // moment the page re-renders — the CDN lags a write by up to ~60s. Tag the
  // fetch so /api/admin/homepage can invalidate it on demand (revalidateTag).
  const doc = await client.withConfig({ useCdn: false }).fetch<{
    heroImage?: { url?: string; alt?: string };
    aboutImage?: { url?: string; alt?: string };
    galleryImages?: { url?: string; alt?: string }[];
  } | null>(
    `*[_type == "homepage"][0]{ heroImage, aboutImage, galleryImages }`,
    {},
    { next: { tags: ['homepage'] } },
  );

  if (!doc) return HOMEPAGE_FALLBACK;

  const gallery = (doc.galleryImages || [])
    .filter((g) => g?.url)
    .map((g) => ({ url: g.url as string, alt: g.alt || '' }));

  return {
    hero: slot(doc.heroImage, HOMEPAGE_FALLBACK.hero),
    about: slot(doc.aboutImage, HOMEPAGE_FALLBACK.about),
    gallery: gallery.length ? gallery : HOMEPAGE_FALLBACK.gallery,
  };
}

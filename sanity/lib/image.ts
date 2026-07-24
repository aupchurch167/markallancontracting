import imageUrlBuilder from '@sanity/image-url';
import type { Image } from 'sanity';
import { dataset, projectId, isSanityConfigured } from '../env';

const builder = isSanityConfigured
  ? imageUrlBuilder({ projectId, dataset })
  : null;

/** Build a Sanity CDN image URL, or null when Sanity is not configured. */
export function urlForImage(source: Image | undefined | null) {
  if (!builder || !source) return null;
  return builder.image(source).auto('format').fit('max');
}

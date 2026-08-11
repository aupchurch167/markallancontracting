import 'server-only';
import sharp from 'sharp';

/**
 * Deterministic image processing (align/crop/optimize) with sharp — no AI, no
 * hallucination. Auto-orients from EXIF (fixes sideways phone photos), optionally
 * smart-crops to a target aspect using content-aware attention, caps the size,
 * and re-encodes as an optimized JPEG.
 */

export type CropAspect = '16:9' | '4:3' | '1:1' | 'original';

const DIMS: Record<Exclude<CropAspect, 'original'>, { w: number; h: number }> = {
  '16:9': { w: 1600, h: 900 },
  '4:3': { w: 1600, h: 1200 },
  '1:1': { w: 1400, h: 1400 },
};

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
}

/** Auto-orient + downscale + optimize, keeping the original aspect ratio. */
export async function orientOptimize(buffer: Buffer): Promise<ProcessedImage> {
  const out = await sharp(buffer)
    .rotate() // honor EXIF orientation
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  return { buffer: out, mimeType: 'image/jpeg' };
}

/** Auto-orient + content-aware crop to a fixed aspect ratio. */
export async function alignAndCrop(buffer: Buffer, aspect: CropAspect): Promise<ProcessedImage> {
  if (aspect === 'original') return orientOptimize(buffer);
  const { w, h } = DIMS[aspect];
  const out = await sharp(buffer)
    .rotate()
    .resize(w, h, { fit: 'cover', position: sharp.strategy.attention })
    .jpeg({ quality: 84 })
    .toBuffer();
  return { buffer: out, mimeType: 'image/jpeg' };
}

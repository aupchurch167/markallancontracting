import { notFound } from 'next/navigation';

/**
 * DEFERRED. The route exists but returns 404 until a real ground-up delivery
 * exists to point at. Do not link to it anywhere. Publish only when there is a
 * completed ground-up project to reference.
 */
export default function DevelopmentPage() {
  notFound();
}

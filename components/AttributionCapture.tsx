'use client';

import { useEffect } from 'react';
import { captureFirstTouch } from '@/lib/first-touch';

/**
 * Records first-touch campaign parameters on the first page of the browser
 * session. Later client navigations keep that snapshot. Renders nothing.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureFirstTouch();
  }, []);
  return null;
}

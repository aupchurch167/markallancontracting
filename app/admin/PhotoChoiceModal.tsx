'use client';

import { Button, Card, Icon, Spinner } from './ui';

export interface PhotoResult {
  originalUrl: string;
  croppedUrl: string;
  enhancedUrl: string | null;
  enhanceError: string | null;
  check: { ok: boolean; notes: string };
  geminiConfigured: boolean;
}

/**
 * Before/after picker shown after a photo is processed: the admin compares the
 * original (auto-oriented), the auto-cropped/aligned version, and the
 * Gemini-enhanced version, sees the quality note, and keeps one.
 */
export function PhotoChoiceModal({
  open,
  busy,
  result,
  onChoose,
  onCancel,
}: {
  open: boolean;
  busy: boolean;
  result: PhotoResult | null;
  onChoose: (url: string) => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  const options: { key: string; label: string; tag: string; url: string }[] = [];
  if (result) {
    if (result.enhancedUrl) {
      options.push({ key: 'enhanced', label: 'Enhanced', tag: 'AI lighting + color', url: result.enhancedUrl });
    }
    options.push({ key: 'cropped', label: 'Cropped & aligned', tag: 'Straightened, cropped to fit', url: result.croppedUrl });
    options.push({ key: 'original', label: 'Original', tag: 'Just oriented, uncropped', url: result.originalUrl });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4">
      <Card className="w-full max-w-3xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-navy">Choose a version</h3>
          <button onClick={onCancel} className="text-stone-400 hover:text-navy" aria-label="Cancel">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {busy || !result ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-stone-500">
            <Spinner />
            <p className="text-sm">Aligning, cropping, and enhancing the photo…</p>
          </div>
        ) : (
          <>
            {result.check.notes ? (
              <div
                className={`mt-3 rounded-lg border p-3 text-sm ${
                  result.check.ok
                    ? 'border-stone-200 bg-stone-50 text-stone-600'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}
              >
                <span className="font-semibold">{result.check.ok ? 'Looks good.' : 'Heads up:'}</span>{' '}
                {result.check.notes}
              </div>
            ) : null}

            {result.enhanceError && result.geminiConfigured ? (
              <p className="mt-2 text-xs text-stone-400">
                (AI enhancement unavailable this time — pick a version below.)
              </p>
            ) : null}

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {options.map((opt) => (
                <div key={opt.key} className="flex flex-col overflow-hidden rounded-lg border border-stone-200">
                  <div className="relative aspect-[16/9] bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={opt.url} alt={opt.label} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <div className="text-sm font-semibold text-navy">{opt.label}</div>
                    <div className="mt-0.5 text-xs text-stone-400">{opt.tag}</div>
                    <Button
                      variant={opt.key === 'enhanced' ? 'primary' : 'ghost'}
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => onChoose(opt.url)}
                    >
                      Use this
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

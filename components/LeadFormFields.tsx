'use client';

import { useEffect, useId, useState } from 'react';
import { captureFirstTouch } from '@/lib/first-touch';
import {
  ATTRIBUTION_FIELDS,
  HEARD_ABOUT_FIELD,
  LEAD_SOURCES,
  labelFor,
  type Attribution,
} from '@/lib/lead-attribution';

type Variant = 'light' | 'dark';

/**
 * Required "How did you hear about us?" control plus hidden first-touch fields.
 * On mailto forms, submit is checked by POST /api/contact (validate + sanitize)
 * and then the browser's own mail client still sends the message.
 */
export function LeadFormFields({ variant = 'light' }: { variant?: Variant }) {
  const selectId = useId();
  const errorId = useId();
  const [error, setError] = useState('');

  useEffect(() => {
    const select = document.getElementById(selectId);
    const form = select?.closest('form');
    if (!form || !select) return;

    const apply = () => {
      const touch = captureFirstTouch();
      for (const field of ATTRIBUTION_FIELDS) {
        const input = form.elements.namedItem(field.key);
        if (!(input instanceof HTMLInputElement)) continue;
        if (field.key === 'submitted_from') input.value = window.location.href;
        else input.value = touch[field.key];
      }
      const heard = form.elements.namedItem(HEARD_ABOUT_FIELD);
      const source = form.elements.namedItem('leadSource');
      if (heard instanceof HTMLInputElement && source instanceof HTMLSelectElement) {
        heard.value = labelFor(source.value);
      }
    };

    apply();
    select.addEventListener('change', apply);

    const action = form.getAttribute('action') || '';
    if (!action.startsWith('mailto:')) {
      return () => select.removeEventListener('change', apply);
    }

    const onSubmit = (event: Event) => {
      event.preventDefault();
      void gateThenMail(form, apply, setError);
    };
    form.addEventListener('submit', onSubmit);
    return () => {
      select.removeEventListener('change', apply);
      form.removeEventListener('submit', onSubmit);
    };
  }, [selectId]);

  const labelClass =
    variant === 'dark'
      ? 'text-[13px] font-semibold uppercase tracking-[0.08em] text-cream-muted'
      : 'field-label';
  const selectClass =
    variant === 'dark'
      ? 'w-full rounded-[2px] border border-cream/15 bg-ink px-3.5 py-3 text-[15px] text-cream outline-none focus:border-rose'
      : 'field-input';

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={selectId} className={labelClass}>
        How did you hear about us?
      </label>
      <select
        id={selectId}
        name="leadSource"
        required
        defaultValue=""
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        autoComplete="off"
        className={selectClass}
      >
        <option value="" disabled>
          Select one
        </option>
        {LEAD_SOURCES.map((source) => (
          <option key={source.key} value={source.key}>
            {source.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className={variant === 'dark' ? 'text-[13px] text-rose' : 'text-[13px] text-maroon'}>
          {error}
        </p>
      )}
      <input type="hidden" name={HEARD_ABOUT_FIELD} defaultValue="" />
      {ATTRIBUTION_FIELDS.map((field) => (
        <input key={field.key} type="hidden" name={field.key} defaultValue="" />
      ))}
      {/* Honeypot. Real visitors never focus this. Disabled before a real mailto send so it stays out of the office email. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        defaultValue=""
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        style={{ clipPath: 'inset(50%)' }}
      />
    </div>
  );
}

async function gateThenMail(
  form: HTMLFormElement,
  apply: () => void,
  setError: (message: string) => void,
) {
  apply();
  const submitter = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (submitter) submitter.disabled = true;
  setError('');

  const leadSource = valueOf(form, 'leadSource');
  const attribution: Partial<Attribution> = {};
  for (const field of ATTRIBUTION_FIELDS) attribution[field.key] = valueOf(form, field.key);

  let dropped = false;
  let accepted = false;
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadSource,
        company: valueOf(form, 'company'),
        attribution,
      }),
    });
    if (res.status === 422) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || 'Tell us how you heard about us.');
      const select = form.elements.namedItem('leadSource');
      if (select instanceof HTMLSelectElement) select.focus();
      if (submitter) submitter.disabled = false;
      return;
    }
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        dropped?: boolean;
        leadSource?: string;
        label?: string;
        attribution?: Partial<Attribution>;
      };
      if (data.dropped) {
        dropped = true;
      } else {
        accepted = true;
        writeBack(form, data.leadSource, data.label, data.attribution);
      }
    }
  } catch {
    /* Network failure: keep the existing mailto path so the lead is not lost. */
  }

  if (dropped) {
    if (submitter) submitter.disabled = false;
    return;
  }
  if (!accepted) {
    const heard = form.elements.namedItem(HEARD_ABOUT_FIELD);
    if (heard instanceof HTMLInputElement) heard.value = labelFor(leadSource);
  }

  // Keep the honeypot out of the office email. Programmatic submit does not
  // re-fire this handler, and mailto leaves the page in place, so re-enable
  // afterwards in case the visitor dismisses their mail draft.
  const honey = form.elements.namedItem('company');
  if (honey instanceof HTMLInputElement && !honey.value.trim()) honey.disabled = true;
  form.submit();
  if (honey instanceof HTMLInputElement) honey.disabled = false;
  if (submitter) submitter.disabled = false;
}

function valueOf(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name);
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    return el.value;
  }
  return '';
}

function writeBack(
  form: HTMLFormElement,
  leadSource: string | undefined,
  label: string | undefined,
  attribution: Partial<Attribution> | undefined,
) {
  if (leadSource) {
    const select = form.elements.namedItem('leadSource');
    if (select instanceof HTMLSelectElement) select.value = leadSource;
  }
  const heard = form.elements.namedItem(HEARD_ABOUT_FIELD);
  if (heard instanceof HTMLInputElement) heard.value = label || labelFor(leadSource || '');
  if (!attribution) return;
  for (const field of ATTRIBUTION_FIELDS) {
    const input = form.elements.namedItem(field.key);
    if (input instanceof HTMLInputElement && typeof attribution[field.key] === 'string') {
      input.value = attribution[field.key] as string;
    }
  }
}

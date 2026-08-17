import Link from 'next/link';
import { SITE } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="text-sm font-bold uppercase tracking-wider text-maroon">404</div>
      <h1 className="mt-3 text-3xl font-bold text-ink">Nothing here</h1>
      <p className="mt-3 text-body">
        That page doesn&apos;t exist. Let&apos;s get you back to work.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-call">Home</Link>
        <Link href="/services" className="btn-ghost">Services</Link>
      </div>
      <p className="mt-10 text-xs text-faint">
        {SITE.name} · Commercial general contractor since {SITE.established}
      </p>
    </div>
  );
}

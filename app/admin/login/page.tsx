import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-[2px] border border-hairline bg-[#FFFFFF] p-8 shadow-[0_16px_40px_rgba(29,21,23,0.06)]">
        <div className="flex items-baseline gap-2 font-display text-[19px] uppercase tracking-wordmark">
          <span className="font-bold text-ink">Mark Allan</span>
          <span className="font-medium text-faint">Contracting</span>
        </div>
        <div className="mt-3 kicker text-maroon">Content console</div>
        <p className="mt-3 text-sm text-muted">Sign in to draft posts and projects.</p>
        <Suspense fallback={<div className="mt-6 h-40" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

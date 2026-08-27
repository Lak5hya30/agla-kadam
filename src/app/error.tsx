"use client";

import Link from "next/link";

/** Global error boundary — never exposes a raw stack trace to the citizen (§46). */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-content space-y-4 py-10 text-center">
      <p className="text-4xl" aria-hidden="true">😕</p>
      <h1 className="text-2xl font-extrabold text-ink">Something went wrong</h1>
      <p className="text-ink-soft">
        This is a demo prototype. Please try again, or return to the start.
      </p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-ghost">
          Go home
        </Link>
      </div>
    </div>
  );
}

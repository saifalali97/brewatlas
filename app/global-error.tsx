"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0705] text-stone-100 antialiased">
        <main
          id="main-content"
          className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        >
          <h1 className="text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
            Something went wrong
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-stone-400">
            BrewAtlas hit an unexpected error. You can try again or return to the homepage.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-stone-50 px-8 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-200"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full border border-stone-600/45 bg-white/[0.04] px-8 text-sm font-medium text-stone-100"
            >
              Back to home
            </Link>
          </div>
          {error.digest ? (
            <p className="mt-6 text-xs text-stone-600" aria-hidden>
              Reference: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}

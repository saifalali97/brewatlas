"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportClientError } from "@/lib/observability/report-client-error";
import { LOCALE_COOKIE_NAME } from "@/types/i18n";
import type { Locale } from "@/types/i18n";

const copy = {
  en: {
    title: "Something went wrong",
    description: "BrewAtlas hit an unexpected error. You can try again or return to the homepage.",
    tryAgain: "Try again",
    backHome: "Back to home",
  },
  ar: {
    title: "حدث خطأ ما",
    description: "واجه بريو أطلس خطأً غير متوقع. يمكنك المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.",
    tryAgain: "حاول مرة أخرى",
    backHome: "العودة إلى الرئيسية",
  },
} as const;

function readLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE_NAME}=([^;]+)`));
  return match?.[1] === "ar" ? "ar" : "en";
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale: Locale = typeof document !== "undefined" ? readLocaleFromCookie() : "en";
  const labels = copy[locale];

  useEffect(() => {
    reportClientError(error);
  }, [error]);

  return (
    <html lang={locale}>
      <body className="bg-[#0a0705] text-stone-100 antialiased">
        <main
          id="main-content"
          className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        >
          <h1 className="text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
            {labels.title}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-stone-400">{labels.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-stone-50 px-8 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-200"
            >
              {labels.tryAgain}
            </button>
            <Link
              href="/"
              className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full border border-stone-600/45 bg-white/[0.04] px-8 text-sm font-medium text-stone-100"
            >
              {labels.backHome}
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

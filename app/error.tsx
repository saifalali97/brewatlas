"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttons } from "@/lib/constants/styles";
import { serializeError } from "@/lib/debug/server-auth-debug";
import { useTranslations } from "@/lib/i18n/translation-context";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const { t } = useTranslations();

  useEffect(() => {
    const payload = {
      ...serializeError(error),
      digest: error.digest ?? "(no digest)",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      browserFamily:
        typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/Chrome|Chromium|Edg|OPR/.test(navigator.userAgent)
          ? "safari"
          : typeof navigator !== "undefined" && /Chrome|CriOS/.test(navigator.userAgent)
            ? "chrome"
            : "other",
      href: typeof window !== "undefined" ? window.location.href : null,
      note: "If digest appears in Vercel [SERVER DEBUG ...] exception logs, that pinpoints the server throw",
    };
    console.error("[SERVER DEBUG SafariCompare error.tsx] boundary activated", payload);
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-[#0a0705] px-6 text-center text-stone-100"
    >
      <h1 className="text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
        {t("errorPages.errorTitle")}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-stone-400">
        {t("errorPages.errorDescription")}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="button" onClick={() => unstable_retry()} className={buttons.primary}>
          {t("errors.tryAgain")}
        </button>
        <Link href="/" className={buttons.secondary}>
          {t("errorPages.notFoundCta")}
        </Link>
      </div>
    </main>
  );
}

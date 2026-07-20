"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { reportClientError } from "@/lib/observability/report-client-error";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const { t } = useTranslations();

  useEffect(() => {
    reportClientError(error);
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

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n/translation-context";

export function FloatingActions() {
  const { t } = useTranslations();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed bottom-6 end-5 z-40 flex flex-col gap-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:end-6 md:bottom-8 md:end-8 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <a
        href="/premium"
        aria-label={t("nav.joinPremiumAriaLabel")}
        className="animate-float hidden items-center gap-2 rounded-full border border-amber-700/30 bg-amber-950/80 px-4 py-2.5 text-xs font-medium text-amber-100 shadow-[0_8px_32px_-8px_rgba(217,119,6,0.35)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-amber-600/40 hover:shadow-[0_12px_40px_-8px_rgba(217,119,6,0.45)] active:scale-[0.97] sm:inline-flex"
      >
        {t("nav.joinPremium")}
      </a>
      <button
        type="button"
        onClick={scrollToTop}
        aria-label={t("common.scrollToTop")}
        className="animate-float flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#0a0705]/85 text-stone-300 shadow-[0_8px_28px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.04] hover:border-white/15 hover:text-stone-100 hover:shadow-[0_12px_36px_-8px_rgba(0,0,0,0.55)] active:scale-[0.97]"
        style={{ animationDelay: "0.6s" }}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4"
          aria-hidden
        >
          <path
            d="M10 4v12M10 4l-4 4M10 4l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

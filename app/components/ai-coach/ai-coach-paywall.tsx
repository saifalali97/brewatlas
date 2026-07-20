"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";

type AiCoachPaywallProps = {
  isAuthenticated: boolean;
  reason?: string;
};

export function AiCoachPaywall({ isAuthenticated, reason }: AiCoachPaywallProps) {
  const { t } = useTranslations();
  const loginHref = `/login?redirectTo=${encodeURIComponent("/ai-coach")}`;
  const ctaHref = isAuthenticated ? "/premium" : loginHref;
  const ctaLabel = isAuthenticated ? t("aiCoachModule.upgradeCta") : t("aiCoachModule.signInCta");

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-ba-gold/25 bg-gradient-to-b from-ba-sand/50 via-ba-pearl to-ba-pearl p-8 text-center shadow-[0_24px_64px_-24px_rgba(184,149,107,0.25)] sm:p-10">
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-ba-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-ba-gold/30 bg-ba-gold/10 text-ba-bronze">
          <Lock className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-ba-espresso sm:text-2xl">
          {t("aiCoachModule.paywallTitle")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ba-charcoal/80 sm:text-base">
          {reason ?? t("aiCoachModule.paywallDescription")}
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <RippleLink href={ctaHref} className={`${buttons.primary} w-full sm:w-auto`}>
            {ctaLabel}
          </RippleLink>
          {!isAuthenticated && (
            <Link href="/premium" className={`${buttons.secondary} w-full sm:w-auto`}>
              {t("aiCoachModule.viewPlans")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

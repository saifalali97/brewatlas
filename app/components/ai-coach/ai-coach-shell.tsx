"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  ChevronLeft,
  FlaskConical,
  History,
  MessageSquare,
  Sparkles,
  Stethoscope,
  Wand2,
} from "lucide-react";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { useTranslations } from "@/lib/i18n/translation-context";

const NAV_ITEMS = [
  { href: "/ai-coach", icon: Sparkles, labelKey: "aiCoachModule.navHome" as const, exact: true },
  { href: "/ai-coach/chat", icon: MessageSquare, labelKey: "aiCoachModule.navChat" as const },
  { href: "/ai-coach/brew-doctor", icon: Stethoscope, labelKey: "aiCoachModule.navBrewDoctor" as const },
  { href: "/ai-coach/guided-brew", icon: Wand2, labelKey: "aiCoachModule.navGuidedBrew" as const },
  { href: "/ai-coach/recipe-generator", icon: FlaskConical, labelKey: "aiCoachModule.navRecipeGenerator" as const },
  { href: "/ai-coach/analyze", icon: Brain, labelKey: "aiCoachModule.navAnalyzer" as const },
  { href: "/ai-coach/brew-memory", icon: History, labelKey: "aiCoachModule.navBrewMemory" as const },
  { href: "/ai-coach/knowledge", icon: BookOpen, labelKey: "aiCoachModule.navKnowledge" as const },
];

type AiCoachShellProps = {
  children: React.ReactNode;
  usage?: { used: number; limit: number | null; remaining: number | null; isUnlimited: boolean };
};

export function AiCoachShell({ children, usage }: AiCoachShellProps) {
  const pathname = usePathname();
  const { t } = useTranslations();

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      <aside className="lg:w-56 lg:shrink-0">
        <Link
          href="/"
          className={`${acTypography.eyebrow} mb-6 inline-flex items-center gap-1.5 text-stone-500 hover:text-ba-espresso`}
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          BrewAtlas
        </Link>
        <nav aria-label={t("aiCoachModule.navLabel")} className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
          {NAV_ITEMS.map(({ href, icon: Icon, labelKey, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium transition-colors lg:rounded-xl ${
                  active
                    ? "bg-ba-espresso text-ba-pearl"
                    : "text-ba-charcoal/70 hover:bg-ba-espresso/5 hover:text-ba-espresso"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="whitespace-nowrap">{t(labelKey)}</span>
              </Link>
            );
          })}
        </nav>
        {usage && !usage.isUnlimited && usage.limit !== null && (
          <p className="mt-6 hidden text-xs text-stone-500 lg:block">
            {t("aiCoachModule.usageRemaining", {
              remaining: String(usage.remaining ?? 0),
              limit: String(usage.limit),
            })}
          </p>
        )}
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

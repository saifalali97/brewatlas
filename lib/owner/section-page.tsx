import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

type OwnerSectionConfig = {
  pathname: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export async function buildOwnerSectionMetadata(pathname: string, title: string, description: string): Promise<Metadata> {
  const locale = await getLocale();
  return buildLocalizedMetadata({ pathname, locale, title, description, noIndex: true });
}

export async function OwnerSectionPlaceholder({ pathname, title, description, icon: Icon }: OwnerSectionConfig) {
  const dictionary = await getDictionary(await getLocale());
  const section = dictionary.ownerSections;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-700/25 bg-amber-950/25 text-amber-400">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-50">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-400">{description}</p>
        </div>
      </div>
      <div className="mt-8 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] px-6 py-10 text-center">
        <p className="text-sm font-medium text-stone-200">{section.comingSoonTitle}</p>
        <p className="mt-2 text-sm text-stone-500">{section.comingSoonDescription}</p>
      </div>
      <p className="sr-only">{pathname}</p>
    </div>
  );
}

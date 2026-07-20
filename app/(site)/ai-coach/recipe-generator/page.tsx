import type { Metadata } from "next";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { AiCoachShell } from "@/app/components/ai-coach/ai-coach-shell";
import { RecipeGeneratorTool } from "@/app/components/ai-coach/ai-coach-tools-panel";
import { getAiCoachPageContext } from "@/lib/ai-coach/page-context";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.aiCoachModule;
  return buildLocalizedMetadata({ pathname: "/ai-coach/recipe-generator", locale, title: p.recipeGeneratorTitle, description: p.recipeGeneratorDescription, noIndex: true });
}

export default async function RecipeGeneratorPage() {
  const dictionary = await getDictionary(await getLocale());
  const p = dictionary.aiCoachModule;
  const ctx = await getAiCoachPageContext();

  return (
    <SectionFrame id="recipe-generator" ariaLabelledBy="recipe-generator-heading" padding="compact">
      <PageHeader headingId="recipe-generator-heading" eyebrow={p.eyebrow} title={p.recipeGeneratorTitle} description={p.recipeGeneratorDescription} />
      <AiCoachShell usage={ctx.usage}>
        <RecipeGeneratorTool isAuthenticated={ctx.isAuthenticated} canUseAi={ctx.canUseAi} paywallReason={ctx.paywallReason} />
      </AiCoachShell>
    </SectionFrame>
  );
}

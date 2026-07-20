import type { Metadata } from "next";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { AiCoachShell } from "@/app/components/ai-coach/ai-coach-shell";
import { BrewDoctorTool } from "@/app/components/ai-coach/brew-doctor-tool";
import { getAiCoachPageContext } from "@/lib/ai-coach/page-context";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/ai-coach/brew-doctor",
    locale,
    title: dictionary.aiCoachModule.brewDoctorTitle,
    description: dictionary.aiCoachModule.brewDoctorDescription,
    noIndex: true,
  });
}

export default async function BrewDoctorPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.aiCoachModule;
  const ctx = await getAiCoachPageContext();

  return (
    <SectionFrame id="brew-doctor" ariaLabelledBy="brew-doctor-heading" padding="compact">
      <PageHeader headingId="brew-doctor-heading" eyebrow={p.eyebrow} title={p.brewDoctorTitle} description={p.brewDoctorDescription} />
      <AiCoachShell usage={ctx.usage}>
        <BrewDoctorTool isAuthenticated={ctx.isAuthenticated} canUseAi={ctx.canUseAi} paywallReason={ctx.paywallReason} />
      </AiCoachShell>
    </SectionFrame>
  );
}

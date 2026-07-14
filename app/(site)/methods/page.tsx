import type { Metadata } from "next";
import { MethodCard } from "@/app/components/cards/method-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/methods",
    locale,
    title: dictionary.metadata.methodsTitle,
    description: dictionary.metadata.methodsDescription,
  });
}

export default async function MethodsPage() {
  const locale = await getLocale();
  const [dictionary, content] = await Promise.all([getDictionary(locale), getHomeContent(locale)]);

  const difficultyLabels = {
    Beginner: dictionary.homeDifficulty.beginner,
    Intermediate: dictionary.homeDifficulty.intermediate,
    Advanced: dictionary.homeDifficulty.advanced,
  };

  return (
    <SectionFrame id="methods-listing" ariaLabelledBy="methods-listing-heading" padding="compact">
      <PageHeader
        eyebrow={dictionary.homeBrewingMethods.eyebrow}
        title={dictionary.homeBrewingMethods.title}
        description={dictionary.homeBrewingMethods.description}
      />

      <div className="grid gap-6 sm:gap-7 lg:grid-cols-2 lg:gap-8">
        {content.brewMethods.map((method) => (
          <MethodCard
            key={method.name}
            method={method}
            ctaHref="/devices"
            labels={{
              brewTime: dictionary.homeBrewingMethods.brewTimeLabel,
              difficulty: dictionary.homeBrewingMethods.difficultyLabel,
              cupProfile: dictionary.homeBrewingMethods.cupProfileLabel,
              body: dictionary.homeBrewingMethods.bodyLabel,
              acidity: dictionary.homeBrewingMethods.acidityLabel,
              sweetness: dictionary.homeBrewingMethods.sweetnessLabel,
              bestWith: dictionary.homeBrewingMethods.bestWithPrefix,
              learnMethod: dictionary.homeBrewingMethods.learnMethod,
              imageAltTemplate: dictionary.homeBrewingMethods.imageAltTemplate,
              difficultyLabel: difficultyLabels[method.difficulty],
            }}
          />
        ))}
      </div>
    </SectionFrame>
  );
}

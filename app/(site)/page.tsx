import type { Metadata } from "next";
import { HeroSection } from "@/app/components/sections/hero-section";
import { WhyBrewAtlasSection } from "@/app/components/sections/why-brewatlas-section";
import { DiscoverSection } from "@/app/components/sections/discover-section";
import { CoffeeJourneySection } from "@/app/components/sections/coffee-journey-section";
import { PremiumExperienceSection } from "@/app/components/sections/premium-experience-section";
import {
  BrewingMethodsSection,
  CoffeeOriginsSection,
  FeaturedRecipesSection,
} from "@/lib/dynamic-sections";
import { buttons } from "@/lib/constants/styles";
import { featuredRecipes as staticRecipesEn } from "@/data/homepage";
import { getRecipeSlug } from "@/lib/data/recipes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { getMergedHomeContent } from "@/lib/data/homepage-cms";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/",
    locale,
    title: dictionary.metadata.homeTitle,
    description: dictionary.metadata.homeDescription,
  });
}

export default async function Home() {
  const locale = await getLocale();
  const supabase = await createClient();
  const [dictionary, content] = await Promise.all([
    getDictionary(locale),
    getMergedHomeContent(supabase, locale),
  ]);

  const { heroImage, testimonials, featuredRecipes, brewMethods, coffeeOrigins } = content;
  const origins = dictionary.homeCoffeeOrigins;
  const methods = dictionary.homeBrewingMethods;

  const featuredItems = featuredRecipes.slice(0, 6).map((recipe, index) => ({
    recipe,
    slug: getRecipeSlug(staticRecipesEn[index] ?? recipe),
  }));

  return (
    <>
      <HeroSection heroImage={heroImage} />
      <WhyBrewAtlasSection
        about={dictionary.aboutPage}
        hero={dictionary.homeHero}
        stats={[
          { value: dictionary.homePremiumExperience.statRecipesValue, label: dictionary.homeHero.statRecipesLabel },
          { value: "180+", label: dictionary.homeHero.statRoastersLabel },
          { value: "40+", label: dictionary.homeHero.statCountriesLabel },
        ]}
      />
      <DiscoverSection copy={dictionary.homeDiscover} />
      <FeaturedRecipesSection items={featuredItems} btnSecondary={buttons.secondary} />
      <CoffeeJourneySection
        methods={brewMethods.slice(0, 4)}
        eyebrow={methods.eyebrow}
        title={methods.title}
        description={methods.description}
      />
      <BrewingMethodsSection
        methods={brewMethods.slice(0, 4)}
        eyebrow={methods.eyebrow}
        title={methods.title}
        description={methods.description}
        cardLabels={{
          brewTime: methods.brewTimeLabel,
          difficulty: methods.difficultyLabel,
          cupProfile: methods.cupProfileLabel,
          body: methods.bodyLabel,
          acidity: methods.acidityLabel,
          sweetness: methods.sweetnessLabel,
          bestWith: methods.bestWithPrefix,
          learnMethod: methods.learnMethod,
          imageAltTemplate: methods.imageAltTemplate,
          difficultyLabels: {
            Beginner: dictionary.homeDifficulty.beginner,
            Intermediate: dictionary.homeDifficulty.intermediate,
            Advanced: dictionary.homeDifficulty.advanced,
          },
        }}
      />
      <CoffeeOriginsSection
        origins={coffeeOrigins.slice(0, 6)}
        eyebrow={origins.eyebrow}
        title={origins.title}
        description={origins.description}
        cardLabels={{
          premium: dictionary.common.premiumBadge,
          altitude: origins.altitudeLabel,
          process: origins.processLabel,
          roast: origins.roastLabel,
          brewMethod: origins.brewMethodLabel,
          exploreOrigin: origins.exploreOrigin,
          imageAltTemplate: origins.imageAltTemplate,
        }}
      />
      <PremiumExperienceSection copy={dictionary.homePremiumExperience} testimonials={testimonials} />
    </>
  );
}

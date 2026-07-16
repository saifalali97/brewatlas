import type { Metadata } from "next";
import { HeroSection } from "@/app/components/sections/hero-section";
import { WhyBrewAtlasSection } from "@/app/components/sections/why-brewatlas-section";
import { DiscoverSection } from "@/app/components/sections/discover-section";
import { CoffeeCraftSection } from "@/app/components/sections/coffee-journey-section";
import { OriginsAtlasSection } from "@/app/components/sections/origins-atlas-section";
import { PremiumExperienceSection } from "@/app/components/sections/premium-experience-section";
import { SectionCurve } from "@/app/components/ui/section-curve";
import { FeaturedCoverSection, FeaturedTableSection } from "@/lib/dynamic-sections";
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
      {/* Ch 0 — Prologue */}
      <HeroSection heroImage={heroImage} />
      <SectionCurve fill="limestone" />

      {/* Ch 1 — The Map */}
      <WhyBrewAtlasSection
        about={dictionary.aboutPage}
        stats={[
          { value: dictionary.homePremiumExperience.statRecipesValue, label: dictionary.homeHero.statRecipesLabel },
          { value: "180+", label: dictionary.homeHero.statRoastersLabel },
          { value: "40+", label: dictionary.homeHero.statCountriesLabel },
        ]}
      />
      <SectionCurve fill="sand" />

      {/* Ch 2 — Six Worlds */}
      <DiscoverSection copy={dictionary.homeDiscover} />
      <SectionCurve fill="pearl" />

      {/* Ch 3 — The Cover */}
      <FeaturedCoverSection items={featuredItems} />
      <SectionCurve fill="sand" />

      {/* Ch 4 — The Route */}
      <OriginsAtlasSection
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
      <SectionCurve fill="espresso" />

      {/* Ch 5 — The Craft */}
      <CoffeeCraftSection
        method={brewMethods[0]}
        eyebrow={methods.eyebrow}
        title={methods.title}
        description={methods.description}
      />
      <SectionCurve fill="limestone" />

      {/* Ch 6 — The Table */}
      <FeaturedTableSection items={featuredItems} btnSecondary={buttons.secondary} />
      <SectionCurve fill="espresso" flip />

      {/* Ch 7 — The Circle */}
      <PremiumExperienceSection copy={dictionary.homePremiumExperience} testimonials={testimonials} />
    </>
  );
}

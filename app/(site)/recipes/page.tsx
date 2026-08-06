import type { Metadata } from "next";
import Link from "next/link";
import { GulfCountryGrid } from "@/app/components/recipes/gulf-country-grid";
import { RecipesHubHero } from "@/app/components/recipes/recipes-hub-hero";
import {
  getGulfDirectoryCountrySummaries,
  getGulfDirectoryGlobalStats,
} from "@/lib/data/gulf-directory";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata, localizedPathUrl } from "@/lib/seo/localized-metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/recipes",
    locale,
    title: dictionary.recipesDirectory.metaTitle,
    description: dictionary.recipesDirectory.metaDescription,
  });
}

export default async function RecipesHubPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const copy = dictionary.recipesDirectory;
  const supabase = await createClient();

  const [countries, stats] = await Promise.all([
    getGulfDirectoryCountrySummaries(supabase),
    getGulfDirectoryGlobalStats(supabase),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageJsonLd({
              url: localizedPathUrl("/recipes", locale),
              name: copy.heroTitle,
              description: copy.metaDescription,
              itemCount: countries.length,
            }),
          ),
        }}
      />

      <div className="min-h-screen bg-[#FDFCF8] pb-12">
        <RecipesHubHero
          eyebrow={copy.eyebrow}
          title={copy.heroTitle}
          subtitle={copy.heroSubtitle}
          verifiedRoastersLabel={copy.verifiedRoasteriesLabel}
          testedRecipesLabel={copy.testedRecipesLabel}
          brewedWithLoveLabel={copy.brewedWithLoveLabel}
          imageAlt={copy.heroImageAlt}
        />

        <div className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-10">
          <GulfCountryGrid countries={countries} dictionary={dictionary} stats={stats} />

          <div className="mt-10 text-center">
            <Link
              href="/recipes/browse"
              className="inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-[#A67B4A] hover:text-[#8B6914]"
            >
              {copy.browseAllRecipes}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

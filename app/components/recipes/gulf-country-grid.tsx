import { GulfCountryCard } from "@/app/components/recipes/gulf-country-card";
import { RecipesVerifiedCurated } from "@/app/components/recipes/recipes-verified-curated";
import type { GulfDirectoryCountrySummary, GulfDirectoryGlobalStats } from "@/lib/data/gulf-directory";
import { getGulfCountryCopy } from "@/lib/gulf-directory/localize";
import { interpolate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";

type GulfCountryGridProps = {
  countries: GulfDirectoryCountrySummary[];
  dictionary: Dictionary;
  stats: GulfDirectoryGlobalStats;
};

/**
 * Reference grid:
 * Row 1 — 4 country cards
 * Row 2 — 2 country cards + Verified & Curated (2-column span)
 */
export function GulfCountryGrid({ countries, dictionary, stats }: GulfCountryGridProps) {
  const dir = dictionary.recipesDirectory;
  const rowOne = countries.slice(0, 4);
  const rowTwo = countries.slice(4, 6);

  const renderCard = (country: GulfDirectoryCountrySummary) => {
    const copy = getGulfCountryCopy(dictionary, country.slug);

    return (
      <GulfCountryCard
        key={country.slug}
        country={country}
        name={copy.name}
        description={copy.description}
        imageAlt={interpolate(dir.countryCardImageAltTemplate, { country: copy.name })}
        roasterCountLabel={interpolate(dir.roasterCountShortTemplate, {
          count: String(country.roasterCount),
        })}
        recipeCountLabel={interpolate(dir.recipeCountShortTemplate, {
          count: String(country.recipeCount),
        })}
        exploreLabel={interpolate(dir.exploreCtaTemplate, { country: copy.name })}
      />
    );
  };

  return (
    <div aria-label={dir.countriesAriaLabel}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {rowOne.map(renderCard)}
        {rowTwo.map(renderCard)}
        <div className="sm:col-span-2 lg:col-span-2">
          <RecipesVerifiedCurated
            title={dir.verifiedCuratedTitle}
            description={dir.verifiedCuratedCardDescription}
            verifiedRoasteriesStatLabel={dir.verifiedRoasteriesStatLabel}
            testedRecipesStatLabel={dir.testedRecipesStatLabel}
            brewedWithLoveStatLabel={dir.brewedWithLoveStatLabel}
            stats={stats}
          />
        </div>
      </div>
    </div>
  );
}

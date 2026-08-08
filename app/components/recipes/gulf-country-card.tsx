import { CountryCard } from "@/app/components/recipes/directory";
import { gulfCountryPath } from "@/lib/gulf-directory/countries";
import type { GulfDirectoryCountrySummary } from "@/lib/data/gulf-directory";

type GulfCountryCardProps = {
  country: GulfDirectoryCountrySummary;
  name: string;
  description: string;
  imageAlt: string;
  roasterCountLabel: string;
  recipeCountLabel: string;
  exploreLabel: string;
};

/** Gulf country card — thin wrapper over shared CountryCard. */
export function GulfCountryCard({
  country,
  name,
  description,
  imageAlt,
  roasterCountLabel,
  recipeCountLabel,
  exploreLabel,
}: GulfCountryCardProps) {
  const featured = country.featuredRoaster;

  return (
    <CountryCard
      href={gulfCountryPath(country.slug)}
      name={name}
      description={description}
      bannerImage={country.bannerImage}
      imageAlt={imageAlt}
      flag={country.flag}
      roasterCountLabel={roasterCountLabel}
      recipeCountLabel={recipeCountLabel}
      exploreLabel={exploreLabel}
      featuredLogoUrl={featured?.logoUrl}
      featuredName={featured?.name}
    />
  );
}

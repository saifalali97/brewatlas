import { RoasterCard } from "@/app/components/recipes/directory";
import {
  gulfRoasterPath,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import type { GulfCountryPageRoaster } from "@/lib/gulf-directory/country-page-types";

type GulfCountryRoasterCardProps = {
  countrySlug: GulfDirectoryCountrySlug;
  roaster: GulfCountryPageRoaster;
  recipeCountLabel: string;
  specialtyLabel: string;
  exploreLabel: string;
};

/** Roaster card for Gulf country directory grids — thin wrapper over RoasterCard. */
export function GulfCountryRoasterCard({
  countrySlug,
  roaster,
  recipeCountLabel,
  specialtyLabel,
  exploreLabel,
}: GulfCountryRoasterCardProps) {
  return (
    <RoasterCard
      href={gulfRoasterPath(countrySlug, roaster.slug)}
      name={roaster.name}
      city={roaster.city}
      specialty={roaster.specialty}
      recipeCountLabel={recipeCountLabel}
      specialtyLabel={specialtyLabel}
      exploreLabel={exploreLabel}
      logoUrl={roaster.logoUrl}
    />
  );
}

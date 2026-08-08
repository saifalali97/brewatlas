import { redirect } from "next/navigation";
import { getCachedDirectoryRoasterBySlug } from "@/lib/data/cached-directory";
import {
  findGulfCountryByDbCountry,
  gulfRoasterPath,
} from "@/lib/gulf-directory/countries";
import { findPlaceholderGulfCountrySlugForRoaster } from "@/lib/gulf-directory/country-page-data";

type RoasteryRedirectProps = {
  params: Promise<{ roasterSlug: string }>;
};

/** Legacy `/recipes/roasters/[slug]` → nested country roaster path. */
export default async function LegacyRoasteryRedirect({ params }: RoasteryRedirectProps) {
  const { roasterSlug } = await params;

  const dbRoaster = await getCachedDirectoryRoasterBySlug(roasterSlug);
  if (dbRoaster?.countrySlug) {
    redirect(gulfRoasterPath(dbRoaster.countrySlug, roasterSlug));
  }

  if (dbRoaster?.country) {
    const country = findGulfCountryByDbCountry(dbRoaster.country);
    if (country) {
      redirect(gulfRoasterPath(country.slug, roasterSlug));
    }
  }

  const placeholderCountry = findPlaceholderGulfCountrySlugForRoaster(roasterSlug);
  if (placeholderCountry) {
    redirect(gulfRoasterPath(placeholderCountry, roasterSlug));
  }

  redirect("/recipes");
}

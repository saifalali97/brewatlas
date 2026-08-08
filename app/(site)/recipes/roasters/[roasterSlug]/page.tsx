import { redirect } from "next/navigation";
import {
  findGulfCountryByDbCountry,
  gulfRoasterPath,
} from "@/lib/gulf-directory/countries";
import { findGulfCountrySlugForRoaster } from "@/lib/gulf-directory/country-page-data";
import { getGulfDirectoryRoasterBySlug } from "@/lib/data/gulf-directory";
import { createClient } from "@/lib/supabase/server";

type RoasteryRedirectProps = {
  params: Promise<{ roasterSlug: string }>;
};

/** Legacy `/recipes/roasters/[slug]` → nested country roaster path. */
export default async function LegacyRoasteryRedirect({ params }: RoasteryRedirectProps) {
  const { roasterSlug } = await params;

  const placeholderCountry = findGulfCountrySlugForRoaster(roasterSlug);
  if (placeholderCountry) {
    redirect(gulfRoasterPath(placeholderCountry, roasterSlug));
  }

  const supabase = await createClient();
  const roaster = await getGulfDirectoryRoasterBySlug(supabase, roasterSlug);
  const country = roaster?.country ? findGulfCountryByDbCountry(roaster.country) : null;
  if (country) {
    redirect(gulfRoasterPath(country.slug, roasterSlug));
  }

  redirect("/recipes");
}

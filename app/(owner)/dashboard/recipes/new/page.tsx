import type { Metadata } from "next";
import { PageHeader } from "@/app/components/ui/page-header";
import { RecipeForm } from "@/app/components/recipes/recipe-form";
import {
  getBrewingMethodOptions,
  getCoffeeOptions,
  getDeviceOptions,
  getFilterTypeOptions,
  getGrinderOptions,
  getOriginOptions,
  getRoasterOptions,
  getTagOptions,
  getWaterProfileOptions,
} from "@/lib/data/db-recipes";
import { requireOwner } from "@/lib/auth/require-owner";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard/recipes/new",
    locale,
    title: dictionary.metadata.ownerNewRecipeTitle,
    description: dictionary.metadata.ownerNewRecipeDescription,
    noIndex: true,
  });
}

export default async function OwnerNewRecipePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.ownerRecipesPage;
  const { supabase } = await requireOwner();

  const [brewingMethods, devices, grinders, filterTypes, waterProfiles, origins, roasters, coffees, tags] =
    await Promise.all([
      getBrewingMethodOptions(supabase),
      getDeviceOptions(supabase),
      getGrinderOptions(supabase),
      getFilterTypeOptions(supabase),
      getWaterProfileOptions(supabase),
      getOriginOptions(supabase),
      getRoasterOptions(supabase),
      getCoffeeOptions(supabase),
      getTagOptions(supabase),
    ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow={labels.eyebrow} title={labels.newRecipeCta} description={labels.description} centered={false} />

      <div className="rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <RecipeForm
          mode="create"
          variant="owner"
          brewingMethods={brewingMethods}
          devices={devices}
          grinders={grinders}
          filterTypes={filterTypes}
          waterProfiles={waterProfiles}
          origins={origins}
          roasters={roasters}
          coffees={coffees}
          tags={tags}
        />
      </div>
    </div>
  );
}

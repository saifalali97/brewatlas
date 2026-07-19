import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
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
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/recipes/new",
    locale,
    title: dictionary.metadata.newRecipeTitle,
    description: dictionary.metadata.newRecipeDescription,
    noIndex: true,
  });
}

export default async function NewRecipePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const n = dictionary.newRecipePage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/account/recipes/new");
  }

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
    <SectionFrame id="new-recipe-page" ariaLabelledBy="new-recipe-page-heading" padding="compact">
<PageHeader headingId="new-recipe-page-heading" eyebrow={n.eyebrow} title={n.title} description={n.description} centered={false} />

      <div className="max-w-3xl rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <RecipeForm
          mode="create"
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
    </SectionFrame>
  );
}

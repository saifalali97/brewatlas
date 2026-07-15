import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { RecipeForm } from "@/app/components/recipes/recipe-form";
import {
  getBrewingMethodOptions,
  getCoffeeOptions,
  getDeviceOptions,
  getFilterTypeOptions,
  getGrinderOptions,
  getOriginOptions,
  getRecipeFullDetailById,
  getRoasterOptions,
  getTagOptions,
  getWaterProfileOptions,
} from "@/lib/data/db-recipes";
import { getOwnerRecipeVersionCount } from "@/lib/data/owner-recipes";
import { requireOwner } from "@/lib/auth/require-owner";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const { supabase } = await requireOwner();
  const recipe = await getRecipeFullDetailById(supabase, id);

  return buildLocalizedMetadata({
    pathname: `/dashboard/recipes/${id}/edit`,
    locale,
    title: recipe ? `${dictionary.metadata.ownerEditRecipeTitle} — ${recipe.title}` : dictionary.metadata.ownerEditRecipeTitle,
    description: dictionary.metadata.ownerEditRecipeDescription,
    noIndex: true,
  });
}

export default async function OwnerEditRecipePage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.ownerRecipesPage;
  const { supabase } = await requireOwner();

  const recipe = await getRecipeFullDetailById(supabase, id);
  if (!recipe) {
    notFound();
  }

  const [
    brewingMethods,
    devices,
    grinders,
    filterTypes,
    waterProfiles,
    origins,
    roasters,
    coffees,
    tags,
    versionCount,
  ] = await Promise.all([
    getBrewingMethodOptions(supabase),
    getDeviceOptions(supabase),
    getGrinderOptions(supabase),
    getFilterTypeOptions(supabase),
    getWaterProfileOptions(supabase),
    getOriginOptions(supabase),
    getRoasterOptions(supabase),
    getCoffeeOptions(supabase),
    getTagOptions(supabase),
    getOwnerRecipeVersionCount(supabase, id),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow={labels.eyebrow}
        title={recipe.title}
        description={labels.description}
        centered={false}
      />

      <div className="rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <RecipeForm
          mode="edit"
          variant="owner"
          recipeId={recipe.id}
          initialValues={recipe}
          versionCount={versionCount}
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

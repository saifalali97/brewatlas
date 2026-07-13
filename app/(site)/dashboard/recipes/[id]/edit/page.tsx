import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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
  getRecipeFullDetailById,
  getRoasterOptions,
  getTagOptions,
  getWaterProfileOptions,
} from "@/lib/data/db-recipes";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Recipe",
  description: "Edit one of your BrewAtlas recipes.",
  robots: {
    index: false,
    follow: true,
  },
};

type EditRecipePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect(`/login?redirectTo=/dashboard/recipes/${id}/edit`);
  }

  const recipe = await getRecipeFullDetailById(supabase, id);

  if (!recipe) {
    notFound();
  }

  // RLS already scopes this select to the caller's own recipes (or admins),
  // but this is the friendlier, explicit authorization boundary.
  if (recipe.authorId !== authData.user.id) {
    notFound();
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
    <SectionFrame id="edit-recipe-page" ariaLabelledBy="edit-recipe-page-heading" padding="compact">
      <PageHeader
        eyebrow="Contribute"
        title="Edit Recipe"
        description={`Update the details for "${recipe.title}."`}
        centered={false}
      />

      <div className="max-w-3xl rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <RecipeForm
          mode="edit"
          recipeId={recipe.id}
          initialValues={recipe}
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

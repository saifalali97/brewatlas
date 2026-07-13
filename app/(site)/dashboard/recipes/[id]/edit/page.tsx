import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { RecipeForm, type RecipeFormInitialValues } from "@/app/components/recipes/recipe-form";
import {
  getBrewingMethodOptions,
  getDeviceOptions,
  getOriginOptions,
  getRawDbRecipeById,
  getRoasterOptions,
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

  const recipe = await getRawDbRecipeById(supabase, id);

  if (!recipe) {
    notFound();
  }

  // RLS already scopes this select to the caller's own recipes (or admins),
  // but this is the friendlier, explicit authorization boundary.
  if (recipe.author_id !== authData.user.id) {
    notFound();
  }

  const [brewingMethods, devices, origins, roasters] = await Promise.all([
    getBrewingMethodOptions(supabase),
    getDeviceOptions(supabase),
    getOriginOptions(supabase),
    getRoasterOptions(supabase),
  ]);

  const initialValues: RecipeFormInitialValues = {
    title: recipe.title,
    brewingMethodId: recipe.brewing_methods?.id ?? "",
    deviceId: recipe.devices?.id ?? null,
    originId: recipe.origins?.id ?? null,
    roasterId: recipe.roasters?.id ?? null,
    coffeeDose: recipe.coffee_dose,
    water: recipe.water,
    ice: recipe.ice,
    grindSize: recipe.grind_size,
    temperature: recipe.temperature,
    bloom: recipe.bloom,
    brewTime: recipe.brew_time,
    tastingNotes: recipe.tasting_notes,
    instructions: recipe.instructions,
    imageUrl: recipe.image_url,
    featured: recipe.featured,
    premiumOnly: recipe.premium_only,
    published: recipe.published,
  };

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
          initialValues={initialValues}
          brewingMethods={brewingMethods}
          devices={devices}
          origins={origins}
          roasters={roasters}
        />
      </div>
    </SectionFrame>
  );
}

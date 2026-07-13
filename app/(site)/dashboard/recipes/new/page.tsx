import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { RecipeForm } from "@/app/components/recipes/recipe-form";
import {
  getBrewingMethodOptions,
  getDeviceOptions,
  getOriginOptions,
  getRoasterOptions,
} from "@/lib/data/db-recipes";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "New Recipe",
  description: "Create a new coffee recipe to share on BrewAtlas.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/dashboard/recipes/new",
  },
};

export default async function NewRecipePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/dashboard/recipes/new");
  }

  const [brewingMethods, devices, origins, roasters] = await Promise.all([
    getBrewingMethodOptions(supabase),
    getDeviceOptions(supabase),
    getOriginOptions(supabase),
    getRoasterOptions(supabase),
  ]);

  return (
    <SectionFrame id="new-recipe-page" ariaLabelledBy="new-recipe-page-heading" padding="compact">
      <PageHeader
        eyebrow="Contribute"
        title="Create a New Recipe"
        description="Share your brewing process with the BrewAtlas community. Save it as a draft or publish it right away."
        centered={false}
      />

      <div className="max-w-3xl rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <RecipeForm
          mode="create"
          brewingMethods={brewingMethods}
          devices={devices}
          origins={origins}
          roasters={roasters}
        />
      </div>
    </SectionFrame>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrewSessionForm } from "@/app/components/personal/brew-session-form";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getBrewingMethodOptions, getUserRecipes } from "@/lib/data/db-recipes";
import { getBrewSessionDefaultsFromSetup } from "@/lib/data/brew-sessions";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";

type PageProps = {
  searchParams: Promise<{ recipe?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/brew-sessions/new",
    locale,
    title: dictionary.brewSessionsPage.newCta,
    description: dictionary.metadata.brewSessionsDescription,
    noIndex: true,
  });
}

export default async function NewBrewSessionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const l = dictionary.brewSessionsPage;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?redirectTo=/account/brew-sessions/new");

  await ensureProfile(supabase, authData.user);

  const [defaults, recipes, brewingMethods, coffeesRes] = await Promise.all([
    getBrewSessionDefaultsFromSetup(supabase, authData.user.id),
    getUserRecipes(supabase, authData.user.id),
    getBrewingMethodOptions(supabase),
    supabase.from("coffees").select("process, roast_level").limit(500),
  ]);

  const roastLevels = [...new Set((coffeesRes.data ?? []).map((row) => row.roast_level).filter(Boolean))] as string[];
  const processes = [...new Set((coffeesRes.data ?? []).map((row) => row.process).filter(Boolean))] as string[];

  const recipeOptions = recipes.filter((recipe) => recipe.id).map((recipe) => ({ id: recipe.id as string, name: recipe.name }));
  const initialRecipe = params.recipe ? recipes.find((recipe) => recipe.slug === params.recipe) : undefined;

  return (
    <SectionFrame id="new-brew-session-page" ariaLabelledBy="new-brew-session-page-heading" padding="compact" wide>
      <PageHeader
        headingId="new-brew-session-page-heading"
        eyebrow={l.eyebrow}
        title={l.newCta}
        description={l.description}
        centered={false}
      />
      <div className="mt-8 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6 sm:p-8">
        <BrewSessionForm
          mode="create"
          defaults={defaults}
          initialRecipeId={initialRecipe?.id}
          initialBrewMethod={initialRecipe?.brewMethod}
          recipes={recipeOptions}
          roastLevels={roastLevels.sort()}
          processes={processes.sort()}
          brewingMethods={brewingMethods}
        />
      </div>
    </SectionFrame>
  );
}

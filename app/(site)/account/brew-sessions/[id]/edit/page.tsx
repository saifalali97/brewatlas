import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BrewSessionForm } from "@/app/components/personal/brew-session-form";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getBrewingMethodOptions, getUserRecipes } from "@/lib/data/db-recipes";
import { getBrewSessionById, getBrewSessionDefaultsFromSetup } from "@/lib/data/brew-sessions";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: `/account/brew-sessions/${id}/edit`,
    locale,
    title: dictionary.brewSessionsPage.editCta,
    description: dictionary.metadata.brewSessionsDescription,
    noIndex: true,
  });
}

export default async function EditBrewSessionPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const l = dictionary.brewSessionsPage;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect(`/login?redirectTo=/account/brew-sessions/${id}/edit`);

  const [session, defaults, recipes, brewingMethods, coffeesRes] = await Promise.all([
    getBrewSessionById(supabase, authData.user.id, id),
    getBrewSessionDefaultsFromSetup(supabase, authData.user.id),
    getUserRecipes(supabase, authData.user.id),
    getBrewingMethodOptions(supabase),
    supabase.from("coffees").select("process, roast_level").limit(500),
  ]);

  if (!session) notFound();

  const roastLevels = [...new Set((coffeesRes.data ?? []).map((row) => row.roast_level).filter(Boolean))] as string[];
  const processes = [...new Set((coffeesRes.data ?? []).map((row) => row.process).filter(Boolean))] as string[];

  return (
    <SectionFrame id="edit-brew-session-page" ariaLabelledBy="edit-brew-session-page-heading" padding="compact" wide>
      <PageHeader
        headingId="edit-brew-session-page-heading"
        eyebrow={l.eyebrow}
        title={l.editCta}
        description={session.coffeeName ?? session.recipeTitle ?? l.description}
        centered={false}
      />
      <div className="mt-8 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6 sm:p-8">
        <BrewSessionForm
          mode="edit"
          session={session}
          defaults={defaults}
          recipes={recipes.filter((recipe) => recipe.id).map((recipe) => ({ id: recipe.id as string, name: recipe.name }))}
          roastLevels={roastLevels.sort()}
          processes={processes.sort()}
          brewingMethods={brewingMethods}
        />
      </div>
    </SectionFrame>
  );
}

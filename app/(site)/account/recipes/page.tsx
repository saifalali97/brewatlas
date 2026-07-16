import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { DeleteRecipeButton } from "@/app/components/recipes/delete-recipe-button";
import { getUserRecipes } from "@/lib/data/db-recipes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import { buttons } from "@/lib/constants/styles";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/recipes",
    locale,
    title: dictionary.metadata.dashboardRecipesTitle,
    description: dictionary.metadata.dashboardRecipesDescription,
    noIndex: true,
  });
}

export default async function DashboardRecipesPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const r = dictionary.dashboardRecipesPage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/account/recipes");
  }

  const recipes = await getUserRecipes(supabase, data.user.id);

  return (
    <SectionFrame id="dashboard-recipes-page" ariaLabelledBy="dashboard-recipes-page-heading" padding="compact">
      
<div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader headingId="dashboard-recipes-page-heading" eyebrow={r.eyebrow} title={r.title} description={r.description} centered={false} />

        <Link href="/account/recipes/new" className={`${buttons.primary} shrink-0 gap-2`}>
          <Plus className="h-4 w-4" aria-hidden />
          {r.newRecipeCta}
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
          <p className="text-lg font-medium text-stone-100">{r.noRecipesYetTitle}</p>
          <p className="mt-2 text-sm text-stone-500">{r.noRecipesYetDescription}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03]">
          <ul className="divide-y divide-white/[0.07]">
            {recipes.map((recipe) => (
              <li key={recipe.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <p className="font-medium text-stone-100">{recipe.name}</p>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        recipe.published
                          ? "border-emerald-600/35 bg-emerald-950/40 text-emerald-300/90"
                          : "border-stone-600/35 bg-stone-800/40 text-stone-400"
                      }`}
                    >
                      {recipe.published ? r.publishedBadge : r.draftBadge}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-500">
                    {recipe.brewMethod} · {recipe.origin}
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  {recipe.published && (
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className="text-xs font-medium text-stone-400 underline-offset-4 hover:text-amber-400/90 hover:underline"
                    >
                      {r.viewLink}
                    </Link>
                  )}
                  <Link
                    href={`/account/recipes/${recipe.id}/edit`}
                    className="text-xs font-medium text-amber-400/90 underline-offset-4 hover:underline"
                  >
                    {r.editLink}
                  </Link>
                  <DeleteRecipeButton recipeId={recipe.id!} recipeTitle={recipe.name} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionFrame>
  );
}

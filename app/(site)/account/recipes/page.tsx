import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { EmptyState } from "@/app/components/ui/empty-state";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { DeleteRecipeButton } from "@/app/components/recipes/delete-recipe-button";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { getUserRecipes } from "@/lib/data/db-recipes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

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
        <PageHeader
          headingId="dashboard-recipes-page-heading"
          eyebrow={r.eyebrow}
          title={r.title}
          description={r.description}
          centered={false}
        />

        <Link
          href="/account/recipes/new"
          className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-ac-copper/40 px-6 text-sm font-medium text-ac-espresso hover:border-ac-copper/60 ${acFocus.ring}`}
        >
          <Plus className="h-4 w-4" aria-hidden />
          {r.newRecipeCta}
        </Link>
      </div>

      {recipes.length === 0 ? (
        <EmptyState
          title={r.noRecipesYetTitle}
          description={r.noRecipesYetDescription}
          actionLabel={r.newRecipeCta}
          actionHref="/account/recipes/new"
        />
      ) : (
        <ol className="mt-2 list-none space-y-0 p-0">
          {recipes.map((recipe, index) => (
            <li key={recipe.id} className="ac-folio-divider py-6 sm:py-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className={acTypography.caption}>{String(index + 1).padStart(2, "0")}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className={acTypography.folioTitle}>{recipe.name}</p>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        recipe.published
                          ? "border-ac-palm/30 text-ac-palm"
                          : "border-ac-espresso/15 text-ac-walnut/55"
                      }`}
                    >
                      {recipe.published ? r.publishedBadge : r.draftBadge}
                    </span>
                  </div>
                  <p className={`${acTypography.folioMeta} mt-2`}>
                    {recipe.brewMethod} · {recipe.origin}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {recipe.published ? (
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className={`${acTypography.nav} text-ac-copper hover:text-ac-espresso ${acFocus.ring}`}
                    >
                      {r.viewLink}
                    </Link>
                  ) : null}
                  <Link
                    href={`/account/recipes/${recipe.id}/edit`}
                    className={`${acTypography.nav} text-ac-copper hover:text-ac-espresso ${acFocus.ring}`}
                  >
                    {r.editLink}
                  </Link>
                  <DeleteRecipeButton recipeId={recipe.id!} recipeTitle={recipe.name} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionFrame>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OwnerRecipeVersionsPanel } from "@/app/components/owner/recipes/owner-recipe-versions-panel";
import { PageHeader } from "@/app/components/ui/page-header";
import { getRecipeVersions } from "@/lib/data/recipe-versions";
import { getRecipeFullDetailById } from "@/lib/data/db-recipes";
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
    pathname: `/dashboard/recipes/${id}/versions`,
    locale,
    title: recipe
      ? `${dictionary.metadata.ownerRecipeVersionsTitle} — ${recipe.title}`
      : dictionary.metadata.ownerRecipeVersionsTitle,
    description: dictionary.metadata.ownerRecipeVersionsDescription,
    noIndex: true,
  });
}

export default async function OwnerRecipeVersionsPage({ params }: PageProps) {
  const { id } = await params;
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.ownerRecipePublishing;
  const { supabase } = await requireOwner();

  const recipe = await getRecipeFullDetailById(supabase, id);
  if (!recipe) {
    notFound();
  }

  const versions = await getRecipeVersions(supabase, id);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow={labels.eyebrow}
        title={labels.versionHistoryTitle}
        description={labels.versionHistoryDescription}
        centered={false}
      />
      <OwnerRecipeVersionsPanel recipeId={id} recipeTitle={recipe.title} versions={versions} />
    </div>
  );
}

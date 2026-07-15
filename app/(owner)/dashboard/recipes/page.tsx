import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { OwnerRecipesExplorer } from "@/app/components/owner/recipes/owner-recipes-explorer";
import { PageHeader } from "@/app/components/ui/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { getOwnerRecipeFilterOptions, getOwnerRecipesPage } from "@/lib/data/owner-recipes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { buttons } from "@/lib/constants/styles";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    brew?: string;
    device?: string;
    origin?: string;
    status?: string;
    page?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard/recipes",
    locale,
    title: dictionary.metadata.ownerRecipesTitle,
    description: dictionary.metadata.ownerRecipesDescription,
    noIndex: true,
  });
}

export default async function OwnerRecipesPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.ownerRecipesPage;
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.q?.trim() ?? "";
  const brewingMethodId = params.brew ?? "";
  const deviceId = params.device ?? "";
  const originId = params.origin ?? "";
  const status = params.status ?? "";
  const published = status === "published" ? true : status === "draft" ? false : undefined;

  const { supabase } = await requireOwner();

  const [result, filterOptions] = await Promise.all([
    getOwnerRecipesPage(supabase, {
      search,
      brewingMethodId: brewingMethodId || undefined,
      deviceId: deviceId || undefined,
      originId: originId || undefined,
      published,
      page,
    }),
    getOwnerRecipeFilterOptions(supabase),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader eyebrow={labels.eyebrow} title={labels.title} description={labels.description} centered={false} />
        <Link href="/dashboard/recipes/new" className={`${buttons.primary} shrink-0 gap-2`}>
          <Plus className="h-4 w-4" aria-hidden />
          {labels.newRecipeCta}
        </Link>
      </div>

      <OwnerRecipesExplorer
        result={result}
        filterOptions={filterOptions}
        labels={labels}
        dictionary={dictionary}
        filters={{
          search,
          brewingMethodId,
          deviceId,
          originId,
          published: status,
        }}
      />
    </div>
  );
}

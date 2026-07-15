import type { Metadata } from "next";
import { MediaLibraryExplorer } from "@/app/components/owner/media/media-library-explorer";
import { PageHeader } from "@/app/components/ui/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { getMediaAssetsPage, getMediaFolders } from "@/lib/data/media-library";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

type PageProps = {
  searchParams: Promise<{ q?: string; folder?: string; page?: string; view?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard/media",
    locale,
    title: dictionary.metadata.ownerMediaTitle,
    description: dictionary.metadata.ownerMediaDescription,
    noIndex: true,
  });
}

export default async function OwnerMediaPage({ searchParams }: PageProps) {
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.ownerMediaPage;
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.q?.trim() ?? "";
  const folderId = params.folder ?? "";
  const view = params.view === "list" ? "list" : "grid";

  const { supabase } = await requireOwner();

  const [result, folders] = await Promise.all([
    getMediaAssetsPage(supabase, {
      search,
      folderId: folderId || undefined,
      page,
    }),
    getMediaFolders(supabase),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow={labels.eyebrow} title={labels.title} description={labels.description} centered={false} />
      <MediaLibraryExplorer
        result={result}
        folders={folders}
        labels={labels}
        dictionary={dictionary}
        filters={{ search, folderId, view }}
      />
    </div>
  );
}

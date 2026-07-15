import type { Metadata } from "next";
import { OwnerReviewsExplorer } from "@/app/components/owner/reviews/owner-reviews-explorer";
import { PageHeader } from "@/app/components/ui/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { userHasPermission } from "@/lib/auth/permission-middleware";
import { getOwnerReviewsPage, type OwnerReviewStatusFilter } from "@/lib/data/owner-reviews";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
};

function parseStatus(value: string | undefined): OwnerReviewStatusFilter {
  if (value === "visible" || value === "hidden" || value === "flagged") {
    return value;
  }
  return "all";
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard/reviews",
    locale,
    title: dictionary.metadata.ownerReviewsTitle,
    description: dictionary.metadata.ownerReviewsDescription,
    noIndex: true,
  });
}

export default async function OwnerReviewsPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.ownerReviewsPage;
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.q?.trim() ?? "";
  const status = parseStatus(params.status);

  const { supabase, user } = await requireOwner("/dashboard/reviews");
  const allowed = await userHasPermission(supabase, user.id, "cms.reviews");
  if (!allowed) {
    redirect("/dashboard");
  }

  const result = await getOwnerReviewsPage(supabase, { search, status, page });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow={labels.eyebrow} title={labels.title} description={labels.description} centered={false} />
      <OwnerReviewsExplorer
        result={result}
        labels={labels}
        dictionary={dictionary}
        filters={{ search, status }}
      />
    </div>
  );
}

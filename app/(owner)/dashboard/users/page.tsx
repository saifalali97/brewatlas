import type { Metadata } from "next";
import { OwnerUsersExplorer } from "@/app/components/owner/users/owner-users-explorer";
import { PageHeader } from "@/app/components/ui/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { userHasPermission } from "@/lib/auth/permission-middleware";
import { getOwnerUsersPage, type OwnerUserStatusFilter } from "@/lib/data/owner-users";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

function parseStatus(value: string | undefined): OwnerUserStatusFilter {
  if (value === "active" || value === "suspended") return value;
  return "all";
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard/users",
    locale,
    title: dictionary.metadata.ownerUsersTitle,
    description: dictionary.metadata.ownerUsersDescription,
    noIndex: true,
  });
}

export default async function OwnerUsersPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.ownerUsersPage;
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.q?.trim() ?? "";
  const status = parseStatus(params.status);

  const { supabase, user } = await requireOwner("/dashboard/users");
  const allowed = await userHasPermission(supabase, user.id, "cms.users");
  if (!allowed) {
    redirect("/dashboard");
  }

  const result = await getOwnerUsersPage(supabase, { search, status, page });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow={labels.eyebrow} title={labels.title} description={labels.description} centered={false} />
      <OwnerUsersExplorer result={result} labels={labels} filters={{ search, status }} />
    </div>
  );
}

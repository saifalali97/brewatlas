import type { Metadata } from "next";
import { OwnerAnalyticsDashboard } from "@/app/components/owner/analytics/owner-analytics-dashboard";
import { PageHeader } from "@/app/components/ui/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { userHasPermission } from "@/lib/auth/permission-middleware";
import { getAdminAuditLogPage } from "@/lib/data/admin-audit";
import { getOwnerAnalyticsOverview } from "@/lib/data/owner-analytics";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ auditPage?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard/analytics",
    locale,
    title: dictionary.metadata.ownerAnalyticsTitle,
    description: dictionary.metadata.ownerAnalyticsDescription,
    noIndex: true,
  });
}

export default async function OwnerAnalyticsPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.ownerAnalyticsPage;
  const params = await searchParams;
  const auditPage = Math.max(1, Number(params.auditPage) || 1);

  const { supabase, user } = await requireOwner("/dashboard/analytics");
  const allowed = await userHasPermission(supabase, user.id, "cms.analytics");
  if (!allowed) {
    redirect("/dashboard");
  }

  const [overview, auditLog] = await Promise.all([
    getOwnerAnalyticsOverview(supabase),
    getAdminAuditLogPage(supabase, auditPage),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow={labels.eyebrow} title={labels.title} description={labels.description} centered={false} />
      <OwnerAnalyticsDashboard overview={overview} auditLog={auditLog} labels={labels} locale={locale} />
    </div>
  );
}

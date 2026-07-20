import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { OwnerAnalyticsDashboard } from "@/app/components/owner/analytics/owner-analytics-dashboard";
import { adminCopy } from "@/lib/admin/copy";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { BrewingSetupStatsPanel } from "@/app/components/admin/brewing-setup-stats-panel";
import { getAdminAuditLogPage } from "@/lib/data/admin-audit";
import { getAdminBrewingSetupStats } from "@/lib/data/brewing-setup";
import { getOwnerAnalyticsOverview } from "@/lib/data/owner-analytics";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Metadata } from "next";

type PageProps = {
  searchParams: Promise<{ auditPage?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const labels = adminCopy.analytics;
  return buildAdminMetadata(labels.title, labels.description, "/admin/analytics");
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const labels = adminCopy.analytics;
  const dictionary = await getDictionary("en");
  const auditPage = Math.max(1, Number.parseInt(params.auditPage ?? "1", 10) || 1);

  const { supabase } = await requireAdmin("/admin/analytics");
  const [overview, auditLog, setupStats] = await Promise.all([
    getOwnerAnalyticsOverview(supabase),
    getAdminAuditLogPage(supabase, auditPage),
    getAdminBrewingSetupStats(supabase, 12),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="analytics" title={labels.title} description={labels.description} />
      <OwnerAnalyticsDashboard
        overview={overview}
        auditLog={auditLog}
        labels={dictionary.ownerAnalyticsPage}
        locale="en"
      />
      <BrewingSetupStatsPanel
        stats={setupStats}
        title="Coffee setup statistics"
        description="Most popular grinders and brewers saved in My Coffee Setup."
      />
    </div>
  );
}

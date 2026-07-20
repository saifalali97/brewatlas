import type { Metadata } from "next";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { CommunityStatsPanel } from "@/app/components/admin/community-stats-panel";
import { adminCopy } from "@/lib/admin/copy";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getAdminCommunityAnalytics, getOpenReports } from "@/lib/data/community-platform";

export async function generateMetadata(): Promise<Metadata> {
  const labels = adminCopy.community;
  return buildAdminMetadata(labels.title, labels.description, "/admin/community");
}

export default async function AdminCommunityPage() {
  const labels = adminCopy.community;
  const { supabase } = await requireAdmin("/admin/community");
  const [analytics, reports] = await Promise.all([
    getAdminCommunityAnalytics(supabase, 30),
    getOpenReports(supabase, 25),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="community" title={labels.title} description={labels.description} />
      <CommunityStatsPanel
        analytics={analytics}
        reports={reports}
        title={labels.panelTitle}
        description={labels.panelDescription}
      />
    </div>
  );
}

import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { AiCoachAdminPanel } from "@/app/components/admin/ai-coach-admin-panel";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { adminCopy } from "@/lib/admin/copy";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getAnalyticsStats, getAiCoachSettingsFromDb } from "@/lib/data/ai-coach-module";

export async function generateMetadata() {
  const labels = adminCopy.aiCoach;
  return buildAdminMetadata(labels.title, labels.description, "/admin/ai-coach");
}

export default async function AdminAiCoachPage() {
  const labels = adminCopy.aiCoach;
  const { supabase } = await requireAdmin("/admin/ai-coach");
  const [settings, stats] = await Promise.all([
    getAiCoachSettingsFromDb(supabase),
    getAnalyticsStats(supabase),
  ]);

  return (
    <>
      <AdminPageHeader navId="aiCoach" title={labels.title} description={labels.description} />
      <AiCoachAdminPanel initialSettings={settings} stats={stats} />
    </>
  );
}

import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { AdminLookupExplorer } from "@/app/components/admin/cms/admin-lookup-explorer";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getAdminOriginsPage, type AdminLookupStatusFilter } from "@/lib/data/admin-lookups";
import { deleteAdminOriginAction, toggleAdminOriginPublishAction } from "@/lib/supabase/admin-lookup-actions";
import type { Metadata } from "next";

type PageProps = { searchParams: Promise<{ q?: string; status?: string; page?: string }> };

function parseStatus(value: string | undefined): AdminLookupStatusFilter {
  if (value === "published" || value === "draft") return value;
  return "all";
}

export async function generateMetadata(): Promise<Metadata> {
  const labels = adminCopy.cms.origins;
  return buildAdminMetadata(labels.title, labels.description, ADMIN_CMS_PATHS.origins);
}

export default async function AdminOriginsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const labels = adminCopy.cms.origins;
  const filters = { search: params.q?.trim() ?? "", status: parseStatus(params.status) };
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const { supabase } = await requireAdmin(ADMIN_CMS_PATHS.origins);
  const result = await getAdminOriginsPage(supabase, { ...filters, page });

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="origins" title={labels.title} description={labels.description} />
      <AdminLookupExplorer
        result={result}
        basePath={ADMIN_CMS_PATHS.origins}
        newPath={`${ADMIN_CMS_PATHS.origins}/new`}
        columns={[
          { key: "country", header: labels.columnCountry, render: (item) => <span className="font-medium text-stone-100">{item.country}</span> },
          { key: "region", header: labels.columnRegion, render: (item) => item.region },
        ]}
        labels={labels.table}
        filters={filters}
        onTogglePublish={toggleAdminOriginPublishAction}
        onDelete={deleteAdminOriginAction}
      />
    </div>
  );
}

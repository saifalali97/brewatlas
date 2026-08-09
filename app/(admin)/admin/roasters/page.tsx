import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { AdminLookupExplorer } from "@/app/components/admin/cms/admin-lookup-explorer";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { requireCmsAccess } from "@/lib/admin/cms/require-cms";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { getAdminRoastersPage, type AdminLookupStatusFilter } from "@/lib/data/admin-lookups";
import {
  bulkAdminRoasterAction,
  deleteAdminRoasterAction,
  toggleAdminRoasterPublishAction,
} from "@/lib/supabase/admin-lookup-actions";
import type { Metadata } from "next";

type PageProps = { searchParams: Promise<{ q?: string; status?: string; page?: string }> };

function parseStatus(value: string | undefined): AdminLookupStatusFilter {
  if (value === "published" || value === "draft") return value;
  return "all";
}

export async function generateMetadata(): Promise<Metadata> {
  const labels = adminCopy.cms.roasters;
  return buildAdminMetadata(labels.title, labels.description, ADMIN_CMS_PATHS.roasters);
}

export default async function AdminRoastersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const labels = adminCopy.cms.roasters;
  const filters = { search: params.q?.trim() ?? "", status: parseStatus(params.status) };
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const { supabase } = await requireCmsAccess("cms.roasters", ADMIN_CMS_PATHS.roasters);
  const result = await getAdminRoastersPage(supabase, { ...filters, page });

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="roasters" title={labels.title} description={labels.description} />
      <AdminLookupExplorer
        result={result}
        basePath={ADMIN_CMS_PATHS.roasters}
        newPath={`${ADMIN_CMS_PATHS.roasters}/new`}
        columns={[
          { key: "name", header: labels.columnName, accessor: "name", format: "emphasis" },
          { key: "country", header: labels.columnCountry, accessor: "country" },
          { key: "featured", header: labels.columnFeatured, accessor: "featured", format: "yesNo" },
          { key: "verified", header: labels.columnVerified, accessor: "verified", format: "yesNo" },
        ]}
        labels={labels.table}
        filters={filters}
        onTogglePublish={toggleAdminRoasterPublishAction}
        onDelete={deleteAdminRoasterAction}
        onBulkAction={bulkAdminRoasterAction}
        enableBulk
      />
    </div>
  );
}

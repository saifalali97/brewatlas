import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { AdminLookupExplorer } from "@/app/components/admin/cms/admin-lookup-explorer";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getAdminDevicesPage, type AdminLookupStatusFilter } from "@/lib/data/admin-lookups";
import {
  deleteAdminDeviceAction,
  toggleAdminDevicePublishAction,
} from "@/lib/supabase/admin-lookup-actions";
import type { Metadata } from "next";

type PageProps = { searchParams: Promise<{ q?: string; status?: string; page?: string }> };

function parseStatus(value: string | undefined): AdminLookupStatusFilter {
  if (value === "published" || value === "draft") return value;
  return "all";
}

export async function generateMetadata(): Promise<Metadata> {
  return buildAdminMetadata(adminCopy.cms.devices.title, adminCopy.cms.devices.description, ADMIN_CMS_PATHS.devices);
}

export default async function AdminDevicesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const labels = adminCopy.cms.devices;
  const filters = { search: params.q?.trim() ?? "", status: parseStatus(params.status) };
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const { supabase } = await requireAdmin(ADMIN_CMS_PATHS.devices);
  const result = await getAdminDevicesPage(supabase, { ...filters, page });

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="devices" title={labels.title} description={labels.description} />
      <AdminLookupExplorer
        result={result}
        basePath={ADMIN_CMS_PATHS.devices}
        newPath={`${ADMIN_CMS_PATHS.devices}/new`}
        columns={[
          { key: "name", header: labels.columnName, accessor: "name", format: "emphasis" },
          { key: "slug", header: labels.columnSlug, accessor: "slug", format: "mono" },
          { key: "manufacturer", header: labels.columnManufacturer, accessor: "manufacturer" },
        ]}
        labels={labels.table}
        filters={filters}
        onTogglePublish={toggleAdminDevicePublishAction}
        onDelete={deleteAdminDeviceAction}
      />
    </div>
  );
}

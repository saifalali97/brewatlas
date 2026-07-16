import { AdminOriginForm } from "@/app/components/admin/cms/admin-origin-form";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return buildAdminMetadata(adminCopy.cms.origins.createTitle, adminCopy.cms.origins.description, `${ADMIN_CMS_PATHS.origins}/new`);
}

export default async function AdminNewOriginPage() {
  await requireAdmin(ADMIN_CMS_PATHS.origins);
  const labels = adminCopy.cms.origins.form;

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="origins" title={adminCopy.cms.origins.createTitle} description={adminCopy.cms.origins.description} />
      <AdminOriginForm mode="create" labels={labels} />
    </div>
  );
}

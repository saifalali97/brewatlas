import { AdminRoasterForm } from "@/app/components/admin/cms/admin-roaster-form";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return buildAdminMetadata(adminCopy.cms.roasters.createTitle, adminCopy.cms.roasters.description, `${ADMIN_CMS_PATHS.roasters}/new`);
}

export default async function AdminNewRoasterPage() {
  await requireAdmin(ADMIN_CMS_PATHS.roasters);
  const labels = adminCopy.cms.roasters.form;

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="roasters" title={adminCopy.cms.roasters.createTitle} description={adminCopy.cms.roasters.description} />
      <AdminRoasterForm mode="create" labels={labels} />
    </div>
  );
}

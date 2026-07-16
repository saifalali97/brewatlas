import { AdminDeviceForm } from "@/app/components/admin/cms/admin-device-form";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return buildAdminMetadata(adminCopy.cms.devices.createTitle, adminCopy.cms.devices.description, `${ADMIN_CMS_PATHS.devices}/new`);
}

export default async function AdminNewDevicePage() {
  await requireAdmin(ADMIN_CMS_PATHS.devices);
  const labels = adminCopy.cms.devices.form;

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="devices" title={adminCopy.cms.devices.createTitle} description={adminCopy.cms.devices.description} />
      <AdminDeviceForm mode="create" labels={labels} />
    </div>
  );
}

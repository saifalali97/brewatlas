import { notFound } from "next/navigation";
import { AdminDeviceForm } from "@/app/components/admin/cms/admin-device-form";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getAdminDeviceById } from "@/lib/data/admin-lookups";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildAdminMetadata(adminCopy.cms.devices.editTitle, adminCopy.cms.devices.description, `${ADMIN_CMS_PATHS.devices}/${id}/edit`);
}

export default async function AdminEditDevicePage({ params }: PageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin(ADMIN_CMS_PATHS.devices);
  const device = await getAdminDeviceById(supabase, id);
  if (!device) notFound();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="devices" title={device.name} description={adminCopy.cms.devices.description} />
      <AdminDeviceForm mode="edit" initial={device} labels={adminCopy.cms.devices.form} />
    </div>
  );
}

import { notFound } from "next/navigation";
import { AdminRoasterForm } from "@/app/components/admin/cms/admin-roaster-form";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getAdminRoasterById } from "@/lib/data/admin-lookups";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildAdminMetadata(adminCopy.cms.roasters.editTitle, adminCopy.cms.roasters.description, `${ADMIN_CMS_PATHS.roasters}/${id}/edit`);
}

export default async function AdminEditRoasterPage({ params }: PageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin(ADMIN_CMS_PATHS.roasters);
  const roaster = await getAdminRoasterById(supabase, id);
  if (!roaster) notFound();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="roasters" title={roaster.name} description={adminCopy.cms.roasters.description} />
      <AdminRoasterForm mode="edit" initial={roaster} labels={adminCopy.cms.roasters.form} />
    </div>
  );
}

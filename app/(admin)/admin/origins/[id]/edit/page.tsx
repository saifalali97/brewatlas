import { notFound } from "next/navigation";
import { AdminOriginForm } from "@/app/components/admin/cms/admin-origin-form";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getAdminOriginById } from "@/lib/data/admin-lookups";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildAdminMetadata(adminCopy.cms.origins.editTitle, adminCopy.cms.origins.description, `${ADMIN_CMS_PATHS.origins}/${id}/edit`);
}

export default async function AdminEditOriginPage({ params }: PageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin(ADMIN_CMS_PATHS.origins);
  const origin = await getAdminOriginById(supabase, id);
  if (!origin) notFound();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="origins" title={`${origin.country} — ${origin.region}`} description={adminCopy.cms.origins.description} />
      <AdminOriginForm mode="edit" initial={origin} labels={adminCopy.cms.origins.form} />
    </div>
  );
}

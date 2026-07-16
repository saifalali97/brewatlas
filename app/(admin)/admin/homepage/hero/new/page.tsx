import { AdminHeroForm } from "@/app/components/admin/cms/admin-hero-form";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return buildAdminMetadata(adminCopy.cms.hero.createTitle, adminCopy.cms.hero.description, `${ADMIN_CMS_PATHS.heroBanners}/new`);
}

export default async function AdminNewHeroPage() {
  await requireAdmin(ADMIN_CMS_PATHS.heroBanners);
  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="heroBanners" title={adminCopy.cms.hero.createTitle} description={adminCopy.cms.hero.description} />
      <AdminHeroForm mode="create" />
    </div>
  );
}

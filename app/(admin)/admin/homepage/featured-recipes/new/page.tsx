import { AdminFeaturedRecipeForm } from "@/app/components/admin/cms/admin-featured-recipe-form";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return buildAdminMetadata(adminCopy.cms.featured.createTitle, adminCopy.cms.featured.description, `${ADMIN_CMS_PATHS.featuredRecipes}/new`);
}

export default async function AdminNewFeaturedRecipePage() {
  await requireAdmin(ADMIN_CMS_PATHS.featuredRecipes);
  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="featuredRecipes" title={adminCopy.cms.featured.createTitle} description={adminCopy.cms.featured.description} />
      <AdminFeaturedRecipeForm mode="create" />
    </div>
  );
}

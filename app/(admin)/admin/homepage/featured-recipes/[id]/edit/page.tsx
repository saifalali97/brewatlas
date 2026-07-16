import { notFound } from "next/navigation";
import { AdminFeaturedRecipeForm } from "@/app/components/admin/cms/admin-featured-recipe-form";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getHomepageFeaturedRecipeById } from "@/lib/data/homepage-cms";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildAdminMetadata("Edit featured recipe", adminCopy.cms.featured.description, `${ADMIN_CMS_PATHS.featuredRecipes}/${id}/edit`);
}

export default async function AdminEditFeaturedRecipePage({ params }: PageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin(ADMIN_CMS_PATHS.featuredRecipes);
  const item = await getHomepageFeaturedRecipeById(supabase, id);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="featuredRecipes" title={item.displayName ?? "Featured recipe"} description={adminCopy.cms.featured.description} />
      <AdminFeaturedRecipeForm mode="edit" initial={item} />
    </div>
  );
}

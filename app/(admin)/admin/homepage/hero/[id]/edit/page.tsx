import { notFound } from "next/navigation";
import { AdminHeroForm } from "@/app/components/admin/cms/admin-hero-form";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getHomepageHeroBannerById } from "@/lib/data/homepage-cms";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildAdminMetadata("Edit hero banner", adminCopy.cms.hero.description, `${ADMIN_CMS_PATHS.heroBanners}/${id}/edit`);
}

export default async function AdminEditHeroPage({ params }: PageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin(ADMIN_CMS_PATHS.heroBanners);
  const hero = await getHomepageHeroBannerById(supabase, id);
  if (!hero) notFound();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="heroBanners" title={hero.title} description={adminCopy.cms.hero.description} />
      <AdminHeroForm mode="edit" initial={hero} />
    </div>
  );
}

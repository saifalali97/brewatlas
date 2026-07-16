import Link from "next/link";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { buttons } from "@/lib/constants/styles";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const labels = adminCopy.cms.homepage;
  return buildAdminMetadata(labels.title, labels.description, ADMIN_CMS_PATHS.homepage);
}

const modules = [
  { href: ADMIN_CMS_PATHS.heroBanners, title: adminCopy.cms.homepage.heroLink, description: adminCopy.cms.homepage.heroDescription },
  { href: ADMIN_CMS_PATHS.featuredRecipes, title: adminCopy.cms.homepage.featuredLink, description: adminCopy.cms.homepage.featuredDescription },
  { href: ADMIN_CMS_PATHS.homepageSections, title: adminCopy.cms.homepage.sectionsLink, description: adminCopy.cms.homepage.sectionsDescription },
  { href: ADMIN_CMS_PATHS.media, title: adminCopy.cms.homepage.mediaLink, description: adminCopy.cms.homepage.mediaDescription },
];

export default async function AdminHomepageHubPage() {
  await requireAdmin(ADMIN_CMS_PATHS.homepage);
  const labels = adminCopy.cms.homepage;

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="homepage" title={labels.title} description={labels.description} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors hover:border-amber-500/25 hover:bg-white/[0.04]"
          >
            <h2 className="text-lg font-semibold text-stone-100">{module.title}</h2>
            <p className="mt-2 text-sm text-stone-500">{module.description}</p>
            <span className={`${buttons.secondary} mt-4 inline-flex text-xs`}>Manage</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

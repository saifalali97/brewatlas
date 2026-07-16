import Link from "next/link";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { HOMEPAGE_SECTION_KEYS } from "@/lib/data/homepage-cms";
import { buttons } from "@/lib/constants/styles";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const labels = adminCopy.cms.sections;
  return buildAdminMetadata(labels.title, labels.description, ADMIN_CMS_PATHS.homepageSections);
}

export default async function AdminHomepageSectionsPage() {
  await requireAdmin(ADMIN_CMS_PATHS.homepageSections);

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="homepageSections" title={adminCopy.cms.sections.title} description={adminCopy.cms.sections.description} />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {HOMEPAGE_SECTION_KEYS.map((key) => (
          <Link key={key} href={`${ADMIN_CMS_PATHS.homepageSections}/${key}`} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 hover:border-amber-500/25">
            <p className="font-medium text-stone-100">{key.replace(/_/g, " ")}</p>
            <span className={`${buttons.secondary} mt-3 inline-flex text-xs`}>Edit section</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

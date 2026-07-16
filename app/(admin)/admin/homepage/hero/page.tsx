import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getHomepageHeroBannersPage } from "@/lib/data/homepage-cms";
import { deleteHomepageHeroAction, toggleHomepageHeroPublishAction } from "@/lib/supabase/homepage-cms-actions";
import { buttons } from "@/lib/constants/styles";
import type { Metadata } from "next";

type PageProps = { searchParams: Promise<{ page?: string; q?: string; locale?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const labels = adminCopy.cms.hero;
  return buildAdminMetadata(labels.title, labels.description, ADMIN_CMS_PATHS.heroBanners);
}

export default async function AdminHeroBannersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = params.locale === "ar" ? "ar" : "en";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const { supabase } = await requireAdmin(ADMIN_CMS_PATHS.heroBanners);
  const result = await getHomepageHeroBannersPage(supabase, locale, page, params.q?.trim() ?? "");
  const labels = adminCopy.cms.hero;
  const table = adminCopy.cms.sharedTable;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader navId="heroBanners" title={labels.title} description={labels.description} />
        <Link href={`${ADMIN_CMS_PATHS.heroBanners}/new`} className={`${buttons.primary} inline-flex gap-2 text-sm`}>
          <Plus className="h-4 w-4" aria-hidden />
          {labels.createTitle}
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03]">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-xs uppercase tracking-[0.12em] text-stone-500">
              <th className="px-4 py-3">{labels.columnTitle}</th>
              <th className="px-4 py-3">{labels.columnLocale}</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((item) => (
              <tr key={item.id} className="border-b border-white/[0.05] text-stone-300">
                <td className="px-4 py-4 font-medium text-stone-100">{item.title}</td>
                <td className="px-4 py-4 uppercase">{item.locale}</td>
                <td className="px-4 py-4">{item.published ? table.statusPublished : table.statusDraft}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`${ADMIN_CMS_PATHS.heroBanners}/${item.id}/edit`} className={`${buttons.secondary} text-xs`}>
                      {table.edit}
                    </Link>
                    <form action={toggleHomepageHeroPublishAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="published" value={item.published ? "false" : "true"} />
                      <button type="submit" className={`${buttons.secondary} text-xs`}>
                        {item.published ? table.unpublish : table.publish}
                      </button>
                    </form>
                    <form action={deleteHomepageHeroAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className={`${buttons.secondary} text-xs text-rose-300/90`}>
                        {table.delete}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

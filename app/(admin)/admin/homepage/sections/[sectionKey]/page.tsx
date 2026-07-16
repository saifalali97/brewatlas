import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getHomepageSectionByKey } from "@/lib/data/homepage-cms";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { saveHomepageSectionAction } from "@/lib/supabase/homepage-cms-actions";
import { buttons } from "@/lib/constants/styles";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ sectionKey: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sectionKey } = await params;
  return buildAdminMetadata(`Edit ${sectionKey}`, adminCopy.cms.sections.description, `${ADMIN_CMS_PATHS.homepageSections}/${sectionKey}`);
}

export default async function AdminHomepageSectionEditPage({ params }: PageProps) {
  const { sectionKey } = await params;
  const { supabase } = await requireAdmin(ADMIN_CMS_PATHS.homepageSections);
  const [existing, staticContent] = await Promise.all([
    getHomepageSectionByKey(supabase, "en", sectionKey),
    getHomeContent("en"),
  ]);

  const fallbackMap: Record<string, unknown> = {
    brew_methods: staticContent.brewMethods,
    coffee_origins: staticContent.coffeeOrigins,
    top_roasters: staticContent.topRoasters,
    testimonials: staticContent.testimonials,
    pricing_plans: staticContent.pricingPlans,
    faqs: staticContent.faqs,
  };

  const defaultJson = JSON.stringify(existing?.content ?? fallbackMap[sectionKey] ?? [], null, 2);

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="homepageSections" title={sectionKey.replace(/_/g, " ")} description={adminCopy.cms.sections.description} />
      <form action={saveHomepageSectionAction} className="mt-8 max-w-4xl space-y-4 rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-6">
        <input type="hidden" name="sectionKey" value={sectionKey} />
        <input type="hidden" name="locale" value="en" />
        <div>
          <label className="mb-1 block text-xs text-stone-500">Section title (optional)</label>
          <input name="title" defaultValue={existing?.title ?? ""} className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Content JSON</label>
          <textarea name="contentJson" rows={18} defaultValue={defaultJson} className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 font-mono text-xs text-stone-100" />
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-300">
          <input type="checkbox" name="published" defaultChecked={existing?.published ?? true} className="rounded" />
          Published
        </label>
        <button type="submit" className={`${buttons.primary} text-sm`}>Save section</button>
      </form>
    </div>
  );
}

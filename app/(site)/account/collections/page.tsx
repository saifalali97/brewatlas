import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { CreateCollectionForm } from "@/app/components/collections/create-collection-form";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getUserCollections } from "@/lib/data/collections";
import { getMembershipSummary } from "@/lib/data/membership";
import { translate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { canCreateCollection } from "@/lib/membership/access";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/collections",
    locale,
    title: dictionary.metadata.collectionsTitle,
    description: dictionary.metadata.collectionsDescription,
    noIndex: true,
  });
}

export default async function DashboardCollectionsPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const c = dictionary.collectionsPage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/account/collections");
  }

  const [collections, membership] = await Promise.all([
    getUserCollections(supabase, data.user.id),
    getMembershipSummary(supabase, data.user.id),
  ]);

  const canCreate = canCreateCollection(membership, collections.length);

  return (
    <SectionFrame id="dashboard-collections-page" ariaLabelledBy="dashboard-collections-page-heading" padding="compact">
<PageHeader headingId="dashboard-collections-page-heading" eyebrow={c.eyebrow} title={c.title} description={c.description} centered={false} />

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
          <h2 className="text-lg font-semibold text-stone-50">{c.createSectionTitle}</h2>
          <p className="mt-1.5 text-sm text-stone-500">{c.createSectionDescription}</p>
          <div className="mt-7">
            <CreateCollectionForm canCreate={canCreate} />
          </div>
        </div>

        <div>
          {collections.length === 0 ? (
            <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
              <p className="text-lg font-medium text-stone-100">{c.noCollectionsTitle}</p>
              <p className="mt-2 text-sm text-stone-500">{c.noCollectionsDescription}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03]">
              <ul className="divide-y divide-white/[0.07]">
                {collections.map((collection) => (
                  <li key={collection.id} className="flex items-center justify-between gap-4 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-700/20 bg-amber-950/25 text-amber-500/80">
                        <FolderOpen className="h-[18px] w-[18px]" aria-hidden />
                      </div>
                      <div>
                        <p className="font-medium text-stone-100">{collection.name}</p>
                        <p className="mt-0.5 text-sm text-stone-500">
                          {translate(dictionary, "collectionsPage.recipeCountTemplate", { count: collection.recipeCount })}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/account/collections/${collection.id}`}
                      className="text-sm font-medium text-amber-400/90 underline-offset-4 hover:underline"
                    >
                      {c.viewCollectionCta}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </SectionFrame>
  );
}

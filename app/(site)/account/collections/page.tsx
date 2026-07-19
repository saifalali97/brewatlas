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
        <div className="rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
          <h2 className="text-lg font-semibold text-ac-espresso">{c.createSectionTitle}</h2>
          <p className="mt-1.5 text-sm text-ac-espresso">{c.createSectionDescription}</p>
          <div className="mt-7">
            <CreateCollectionForm canCreate={canCreate} />
          </div>
        </div>

        <div>
          {collections.length === 0 ? (
            <div className="rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl px-8 py-16 text-center">
              <p className="text-lg font-medium text-ac-espresso">{c.noCollectionsTitle}</p>
              <p className="mt-2 text-sm text-ac-espresso">{c.noCollectionsDescription}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl">
              <ul className="divide-y divide-ba-espresso/[0.06]">
                {collections.map((collection) => (
                  <li key={collection.id} className="flex items-center justify-between gap-4 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ba-gold/30 bg-ba-gold/12 text-ba-bronze">
                        <FolderOpen className="h-[18px] w-[18px]" aria-hidden />
                      </div>
                      <div>
                        <p className="font-medium text-ac-espresso">{collection.name}</p>
                        <p className="mt-0.5 text-sm text-ac-espresso">
                          {translate(dictionary, "collectionsPage.recipeCountTemplate", { count: collection.recipeCount })}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/account/collections/${collection.id}`}
                      className="text-sm font-medium text-ac-espresso underline-offset-4 hover:underline"
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

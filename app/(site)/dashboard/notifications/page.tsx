import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotificationsPanel } from "@/app/components/notifications/notifications-panel";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getNotificationsPage } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ page?: string; filter?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard/notifications",
    locale,
    title: dictionary.metadata.notificationsTitle,
    description: dictionary.metadata.notificationsDescription,
    noIndex: true,
  });
}

export default async function DashboardNotificationsPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.notificationsPage;
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const unreadOnly = params.filter === "unread";

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/dashboard/notifications");
  }

  const result = await getNotificationsPage(supabase, data.user.id, { page, unreadOnly });

  return (
    <SectionFrame
      id="dashboard-notifications-page"
      ariaLabelledBy="dashboard-notifications-page-heading"
      padding="compact"
    >
      <PageHeader eyebrow={labels.eyebrow} title={labels.title} description={labels.description} centered={false} />

      <NotificationsPanel
        result={result}
        labels={labels}
        dictionary={dictionary}
        locale={locale}
        unreadOnly={unreadOnly}
      />
    </SectionFrame>
  );
}

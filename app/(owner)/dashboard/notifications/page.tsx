import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotificationsPanel } from "@/app/components/notifications/notifications-panel";
import { SystemAnnouncementForm } from "@/app/components/notifications/system-announcement-form";
import { PageHeader } from "@/app/components/ui/page-header";
import { getNotificationsPage } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { requireOwner } from "@/lib/auth/require-owner";
import { roleHasPermission } from "@/lib/auth/permissions";

type PageProps = {
  searchParams: Promise<{ page?: string; filter?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard/notifications",
    locale,
    title: dictionary.metadata.ownerNotificationsTitle,
    description: dictionary.metadata.ownerNotificationsDescription,
    noIndex: true,
  });
}

export default async function OwnerNotificationsPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.notificationsPage;
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const unreadOnly = params.filter === "unread";
  const { supabase, user, role } = await requireOwner();

  if (!user) {
    redirect("/login?redirectTo=/dashboard/notifications");
  }

  const result = await getNotificationsPage(supabase, user.id, { page, unreadOnly });
  const canBroadcast = roleHasPermission(role, "cms.notifications");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow={labels.eyebrow} title={labels.title} description={labels.description} centered={false} />
      {canBroadcast ? <SystemAnnouncementForm /> : null}
      <NotificationsPanel
        result={result}
        labels={labels}
        dictionary={dictionary}
        locale={locale}
        unreadOnly={unreadOnly}
        pathname="/dashboard/notifications"
      />
    </div>
  );
}

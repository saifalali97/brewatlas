import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NotificationPreferencesForm } from "@/app/components/notifications/notification-preferences-form";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons } from "@/lib/constants/styles";
import { getNotificationPreferences } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/notification-preferences",
    locale,
    title: dictionary.metadata.notificationPreferencesTitle,
    description: dictionary.metadata.notificationPreferencesDescription,
    noIndex: true,
  });
}

export default async function NotificationPreferencesPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.notificationPreferencesPage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/account/notification-preferences");
  }

  const preferences = await getNotificationPreferences(supabase, data.user.id);

  return (
    <SectionFrame
      id="notification-preferences-page"
      ariaLabelledBy="notification-preferences-page-heading"
      padding="compact"
    >
<PageHeader headingId="notification-preferences-page-heading" eyebrow={labels.eyebrow} title={labels.title} description={labels.description} centered={false} />

      <div className="mt-6">
        <Link href="/account/notifications" className={`${buttons.secondary} text-sm`}>
          {labels.backToInboxCta}
        </Link>
      </div>

      <div className="mt-8">
        <NotificationPreferencesForm initialPreferences={preferences} />
      </div>
    </SectionFrame>
  );
}

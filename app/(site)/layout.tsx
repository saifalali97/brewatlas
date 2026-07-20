import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { SiteNav } from "@/app/components/layout/site-nav";
import { FloatingActions } from "@/app/components/layout/client-chrome";
import { SiteFooter } from "@/lib/dynamic-sections";
import { getNotifications, getUnreadNotificationCount } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import { resolveIsAdmin } from "@/lib/auth/is-admin";

const NotificationsBell = dynamic(
  () => import("@/app/components/notifications/notifications-bell").then((mod) => mod.NotificationsBell),
);

/**
 * Shared chrome (background, nav, footer) for every public marketing/app
 * page. Markup is unchanged from the original homepage wrapper so "/"
 * keeps rendering pixel-identical output after the move.
 *
 * Resolves the request's locale once and hands translated nav labels
 * down to `<SiteNav>` -- the dictionary itself stays `server-only` and
 * never reaches the client bundle (see `lib/i18n/get-dictionary.ts`).
 */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  let notificationsSlot: ReactNode = null;
  let isAdmin = false;
  if (authData.user) {
    const [unreadCount, notifications, adminAccess] = await Promise.all([
      getUnreadNotificationCount(supabase, authData.user.id),
      getNotifications(supabase, authData.user.id, { limit: 8 }),
      resolveIsAdmin(supabase, authData.user.id),
    ]);
    isAdmin = adminAccess;

    notificationsSlot = (
      <NotificationsBell
        key={`${unreadCount}-${notifications.map((item) => item.id).join(",")}`}
        userId={authData.user.id}
        initialUnreadCount={unreadCount}
        initialNotifications={notifications}
        labels={dictionary.notificationsPage}
        dictionary={dictionary}
        locale={locale}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-ba-ivory font-sans text-ba-espresso">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(184,149,107,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_90%_30%,rgba(237,228,214,0.5),transparent)]" />
      </div>

      <SiteNav
        nav={dictionary.nav}
        locale={locale}
        isAuthenticated={Boolean(authData.user)}
        isAdmin={isAdmin}
        notificationsSlot={notificationsSlot}
      />

      <main id="main-content" className="pb-[env(safe-area-inset-bottom,0px)]">{children}</main>

      <FloatingActions />
      <SiteFooter
        footer={dictionary.homeFooter}
        locale={locale}
        switchLanguageAria={dictionary.nav.switchLanguageAria}
        languageAriaLabel={dictionary.nav.languageAriaLabel}
      />
    </div>
  );
}

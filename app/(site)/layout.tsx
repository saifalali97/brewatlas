import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { SiteNav } from "@/app/components/layout/site-nav";
import { NotificationsBell } from "@/app/components/notifications/notifications-bell";
import { FloatingActions } from "@/app/components/layout/client-chrome";
import { SiteFooter } from "@/lib/dynamic-sections";
import { getNotifications, getUnreadNotificationCount } from "@/lib/data/community";
import {
  logAndRethrow,
  logSafariAccountComparison,
  logServerAuthDebug,
  summarizeAuthCookies,
  summarizeCookies,
  summarizeRscRequestHeaders,
} from "@/lib/debug/server-auth-debug";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import type { Locale } from "@/types/i18n";
import { createClient } from "@/lib/supabase/server";
import { resolveIsAdmin } from "@/lib/auth/is-admin";
import type { NotificationItem } from "@/types/community";

/**
 * Shared chrome (background, nav, footer) for every public marketing/app
 * page. Markup is unchanged from the original homepage wrapper so "/"
 * keeps rendering pixel-identical output after the move.
 *
 * Resolves the request's locale once and hands translated nav labels
 * down to `<SiteNav>` -- the dictionary itself stays `server-only` and
 * never reaches the client bundle (see `lib/i18n/get-dictionary.ts`).
 *
 * TEMPORARY: server auth debug — see lib/debug/server-auth-debug.ts
 */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const authCookies = summarizeAuthCookies(cookieStore.getAll());

  logServerAuthDebug("SiteLayout", "entry", {
    cookiesReceived: summarizeCookies(cookieStore.getAll()),
    ...authCookies,
    rsc: summarizeRscRequestHeaders(headerStore),
  });

  logSafariAccountComparison("SiteLayout", "entry", {
    ...authCookies,
    rsc: summarizeRscRequestHeaders(headerStore),
    serverComponent: true,
  });

  let locale!: Locale;
  let dictionary: Awaited<ReturnType<typeof getDictionary>>;
  let isAuthenticated = false;
  let isAdmin = false;
  let userId: string | null = null;
  let bellProps: {
    unreadCount: number;
    notifications: NotificationItem[];
    userId: string;
  } | null = null;

  try {
    locale = await getLocale();
    dictionary = await getDictionary(locale);
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    isAuthenticated = Boolean(authData.user);
    userId = authData.user?.id ?? null;

    logServerAuthDebug("SiteLayout", "step", {
      userId,
      authenticated: isAuthenticated,
    });

    if (authData.user) {
      logServerAuthDebug("SiteLayout", "step", {
        step: "loadAuthenticatedChrome",
        userId: authData.user.id,
      });

      const [unreadCount, notifications, adminAccess] = await Promise.all([
        getUnreadNotificationCount(supabase, authData.user.id),
        getNotifications(supabase, authData.user.id, { limit: 8 }),
        resolveIsAdmin(supabase, authData.user.id),
      ]);
      isAdmin = adminAccess;
      bellProps = {
        unreadCount,
        notifications,
        userId: authData.user.id,
      };
    }

    logServerAuthDebug("SiteLayout", "exit", {
      userId,
      isAdmin,
      notificationCount: bellProps ? bellProps.notifications.length : "skipped",
    });
  } catch (error) {
    logAndRethrow("SiteLayout", error, { phase: "data-load" });
  }

  let notificationsSlot: ReactNode = null;
  if (bellProps) {
    notificationsSlot = (
      <NotificationsBell
        key={`${bellProps.unreadCount}-${bellProps.notifications.map((item) => item.id).join(",")}`}
        userId={bellProps.userId}
        initialUnreadCount={bellProps.unreadCount}
        initialNotifications={bellProps.notifications}
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
        isAuthenticated={isAuthenticated}
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

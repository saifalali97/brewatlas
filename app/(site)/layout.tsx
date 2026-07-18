import type { ReactNode } from "react";
import { DebugErrorBoundary } from "@/app/components/debug/debug-error-boundary";
import { DebugGlobalListeners } from "@/app/components/debug/debug-global-listeners";
import { DebugMountLogger } from "@/app/components/debug/debug-mount-logger";
import { SiteNav } from "@/app/components/layout/site-nav";
import { NotificationsBell } from "@/app/components/notifications/notifications-bell";
import { FloatingActions } from "@/app/components/layout/client-chrome";
import { SiteFooter } from "@/lib/dynamic-sections";
import { getNotifications, getUnreadNotificationCount } from "@/lib/data/community";
import { SAFARI_CRASH_DEBUG, logSafariDebug } from "@/lib/debug/safari-crash-debug";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import { resolveIsAdmin } from "@/lib/auth/is-admin";

/**
 * Shared chrome (background, nav, footer) for every public marketing/app
 * page. Markup is unchanged from the original homepage wrapper so "/"
 * keeps rendering pixel-identical output after the move.
 *
 * Resolves the request's locale once and hands translated nav labels
 * down to `<SiteNav>` -- the dictionary itself stays `server-only` and
 * never reaches the client bundle (see `lib/i18n/get-dictionary.ts`).
 *
 * TEMPORARY: Safari crash bisection instrumentation — see lib/debug/safari-crash-debug.ts
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
  const isAuthenticated = Boolean(authData.user);

  logSafariDebug("SiteLayout", "server render", {
    isAuthenticated,
    pathnameHint: "see client navigation",
    flags: SAFARI_CRASH_DEBUG,
  });

  // Step 5 — strip all authenticated chrome; only page content remains.
  if (SAFARI_CRASH_DEBUG.stripEntireAuthenticatedChrome && isAuthenticated) {
    logSafariDebug("SiteLayout", "stripEntireAuthenticatedChrome active — chrome removed");
    return (
      <>
        <DebugGlobalListeners />
        <div data-debug-layout="strip-entire-chrome">{children}</div>
      </>
    );
  }

  let notificationsSlot: ReactNode = null;
  let isAdmin = false;

  if (isAuthenticated) {
    const [unreadCount, notifications, adminAccess] = await Promise.all([
      getUnreadNotificationCount(supabase, authData.user!.id),
      getNotifications(supabase, authData.user!.id, { limit: 8 }),
      resolveIsAdmin(supabase, authData.user!.id),
    ]);
    isAdmin = adminAccess;

    if (SAFARI_CRASH_DEBUG.stripNotificationsBell) {
      logSafariDebug("SiteLayout", "NotificationsBell stripped — notificationsSlot is null");
      notificationsSlot = null;
    } else {
      notificationsSlot = (
        <DebugErrorBoundary name="NotificationsBell">
          <DebugMountLogger name="NotificationsBell">
            <NotificationsBell
              key={`${unreadCount}-${notifications.map((item) => item.id).join(",")}`}
              userId={authData.user!.id}
              initialUnreadCount={unreadCount}
              initialNotifications={notifications}
              labels={dictionary.notificationsPage}
              dictionary={dictionary}
              locale={locale}
            />
          </DebugMountLogger>
        </DebugErrorBoundary>
      );
    }
  }

  const siteNavElement = SAFARI_CRASH_DEBUG.stripSiteNav ? (
    <div
      data-debug-nav="stripped"
      className="border-b border-red-600/40 bg-red-950/20 px-4 py-3 text-xs font-mono text-red-400"
    >
      [DEBUG] SiteNav stripped — bisection step 4
    </div>
  ) : (
    <DebugErrorBoundary name="SiteNav">
      <DebugMountLogger name="SiteNav">
        <SiteNav
          nav={dictionary.nav}
          locale={locale}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          notificationsSlot={notificationsSlot}
        />
      </DebugMountLogger>
    </DebugErrorBoundary>
  );

  return (
    <DebugErrorBoundary name="SiteLayout">
    <div className="relative min-h-screen bg-ba-ivory font-sans text-ba-espresso">
      <DebugGlobalListeners />

      <DebugMountLogger name="SiteLayout">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(184,149,107,0.08),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_90%_30%,rgba(237,228,214,0.5),transparent)]" />
        </div>

        {siteNavElement}

        <main id="main-content" className="pb-[env(safe-area-inset-bottom,0px)]">
          <DebugErrorBoundary name="SiteLayoutPageChildren">
            <DebugMountLogger name="SiteLayoutPageChildren">{children}</DebugMountLogger>
          </DebugErrorBoundary>
        </main>

        <DebugErrorBoundary name="FloatingActions">
          <DebugMountLogger name="FloatingActions">
            <FloatingActions />
          </DebugMountLogger>
        </DebugErrorBoundary>

        <DebugErrorBoundary name="SiteFooter">
          <DebugMountLogger name="SiteFooter">
            <SiteFooter
              footer={dictionary.homeFooter}
              locale={locale}
              switchLanguageAria={dictionary.nav.switchLanguageAria}
              languageAriaLabel={dictionary.nav.languageAriaLabel}
            />
          </DebugMountLogger>
        </DebugErrorBoundary>
      </DebugMountLogger>
    </div>
    </DebugErrorBoundary>
  );
}

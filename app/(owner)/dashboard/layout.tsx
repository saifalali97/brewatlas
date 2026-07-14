import type { ReactNode } from "react";
import { PermissionsProvider } from "@/lib/auth/permissions-context";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { requireOwner } from "@/lib/auth/require-owner";
import { OwnerDashboardShell } from "@/app/components/owner/owner-dashboard-shell";
import { getNotifications, getUnreadNotificationCount } from "@/lib/data/community";

export default async function OwnerDashboardLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const session = await requireOwner();

  const [unreadCount, notifications] = await Promise.all([
    getUnreadNotificationCount(session.supabase, session.user.id),
    getNotifications(session.supabase, session.user.id, { limit: 8 }),
  ]);

  return (
    <PermissionsProvider role={session.role}>
      <OwnerDashboardShell
        displayName={session.displayName}
        userId={session.user.id}
        unreadCount={unreadCount}
        notifications={notifications}
        dictionary={dictionary}
        locale={locale}
      >
        {children}
      </OwnerDashboardShell>
    </PermissionsProvider>
  );
}

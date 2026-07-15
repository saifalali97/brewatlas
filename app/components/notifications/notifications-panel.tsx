import { NotificationsInbox } from "@/app/components/notifications/notifications-inbox";
import type { Dictionary } from "@/lib/i18n/types";
import type { NotificationsPageResult } from "@/types/community";

type NotificationsPanelProps = {
  result: NotificationsPageResult;
  labels: Dictionary["notificationsPage"];
  dictionary: Dictionary;
  locale: string;
  unreadOnly: boolean;
  pathname?: string;
  preferencesPath?: string;
};

export function NotificationsPanel({
  result,
  labels,
  dictionary,
  locale,
  unreadOnly,
  pathname = "/account/notifications",
  preferencesPath,
}: NotificationsPanelProps) {
  return (
    <NotificationsInbox
      key={unreadOnly ? "unread" : "all"}
      initialResult={result}
      labels={labels}
      dictionary={dictionary}
      locale={locale}
      unreadOnly={unreadOnly}
      pathname={pathname}
      preferencesPath={preferencesPath}
    />
  );
}

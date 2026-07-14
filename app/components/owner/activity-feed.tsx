import Image from "next/image";
import type { ActivityFeedItem } from "@/types/community";
import type { Dictionary } from "@/lib/i18n/types";

type OwnerActivityFeedProps = {
  items: ActivityFeedItem[];
  labels: Dictionary["ownerDashboardPage"];
  locale: string;
};

function activityLabel(item: ActivityFeedItem, labels: Dictionary["ownerDashboardPage"]): string {
  const actor = item.user.displayName?.trim() || labels.anonymousUser;
  const recipe = item.recipe?.title?.trim();

  switch (item.activityType) {
    case "brewed_recipe":
      return recipe
        ? labels.activityBrewedTemplate.replace("{actor}", actor).replace("{recipe}", recipe)
        : labels.activityBrewedGeneric.replace("{actor}", actor);
    case "created_recipe":
      return recipe
        ? labels.activityCreatedTemplate.replace("{actor}", actor).replace("{recipe}", recipe)
        : labels.activityCreatedGeneric.replace("{actor}", actor);
    case "reviewed_recipe":
      return recipe
        ? labels.activityReviewedTemplate.replace("{actor}", actor).replace("{recipe}", recipe)
        : labels.activityReviewedGeneric.replace("{actor}", actor);
    case "earned_badge":
      return labels.activityBadgeTemplate.replace("{actor}", actor).replace("{badge}", item.badge?.name ?? "badge");
    case "followed_user":
      return labels.activityFollowedTemplate.replace("{actor}", actor);
    default:
      return labels.activityGeneric.replace("{actor}", actor);
  }
}

function formatTime(value: string, locale: string): string {
  return new Date(value).toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OwnerActivityFeed({ items, labels, locale }: OwnerActivityFeedProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
        <p className="text-sm text-stone-500">{labels.noActivity}</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[0_16px_40px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl">
      <div className="border-b border-white/[0.08] px-6 py-4">
        <h3 className="text-sm font-semibold text-stone-100">{labels.recentActivityTitle}</h3>
        <p className="mt-1 text-xs text-stone-500">{labels.recentActivityDescription}</p>
      </div>
      <ul className="divide-y divide-white/[0.06]">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-4 px-6 py-4">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/[0.1] bg-white/[0.04]">
              {item.user.avatarUrl ? (
                <Image src={item.user.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-stone-500">
                  {(item.user.displayName ?? "?").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-stone-200">{activityLabel(item, labels)}</p>
              <time dateTime={item.createdAt} className="mt-1 block text-xs text-stone-600">
                {formatTime(item.createdAt, locale)}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

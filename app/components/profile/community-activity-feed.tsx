import Image from "next/image";
import Link from "next/link";
import type { ActivityFeedItem } from "@/types/community";
import type { Dictionary } from "@/lib/i18n/types";
import { translate } from "@/lib/i18n/format";

type CommunityActivityFeedProps = {
  items: ActivityFeedItem[];
  dictionary: Dictionary;
  locale: string;
};

function activityLabel(item: ActivityFeedItem, dictionary: Dictionary): string {
  const labels = dictionary.communityPage;
  const actor = item.user.displayName?.trim() || labels.anonymousBrewer;
  const recipe = item.recipe?.title?.trim();
  const collectionName =
    typeof item.metadata.collectionName === "string" ? item.metadata.collectionName : labels.activityCollectionFallback;

  switch (item.activityType) {
    case "brewed_recipe":
      return recipe
        ? translate(dictionary, "communityPage.activityBrewedTemplate", { actor, recipe })
        : translate(dictionary, "communityPage.activityBrewedGeneric", { actor });
    case "created_recipe":
      return recipe
        ? translate(dictionary, "communityPage.activityCreatedTemplate", { actor, recipe })
        : translate(dictionary, "communityPage.activityCreatedGeneric", { actor });
    case "reviewed_recipe":
      return recipe
        ? translate(dictionary, "communityPage.activityReviewedTemplate", { actor, recipe })
        : translate(dictionary, "communityPage.activityReviewedGeneric", { actor });
    case "earned_badge":
      return translate(dictionary, "communityPage.activityBadgeTemplate", {
        actor,
        badge: item.badge?.name ?? "badge",
      });
    case "followed_user":
      return translate(dictionary, "communityPage.activityFollowedTemplate", { actor });
    case "saved_recipe":
      return recipe
        ? translate(dictionary, "communityPage.activitySavedTemplate", { actor, recipe })
        : translate(dictionary, "communityPage.activitySavedGeneric", { actor });
    case "added_to_collection":
      return recipe
        ? translate(dictionary, "communityPage.activityCollectionTemplate", { actor, recipe, collection: collectionName })
        : translate(dictionary, "communityPage.activityCollectionGeneric", { actor, collection: collectionName });
    default:
      return translate(dictionary, "communityPage.activityGeneric", { actor });
  }
}

function formatTime(value: string, locale: string): string {
  return new Date(value).toLocaleString(locale === "ar" ? "ar" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommunityActivityFeed({ items, dictionary, locale }: CommunityActivityFeedProps) {
  const labels = dictionary.communityPage;
  if (items.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center">
        <p className="text-sm text-stone-500">{labels.noActivityYet}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-[1.25rem] border border-white/[0.09] bg-white/[0.02]">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-4 px-5 py-4 sm:px-6">
          <Link href={`/users/${item.user.id}`} className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/[0.1] bg-white/[0.04]">
            {item.user.avatarUrl ? (
              <Image src={item.user.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-stone-500">
                {(item.user.displayName ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-stone-200">{activityLabel(item, dictionary)}</p>
            <time dateTime={item.createdAt} className="mt-1 block text-xs text-stone-600">
              {formatTime(item.createdAt, locale)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}

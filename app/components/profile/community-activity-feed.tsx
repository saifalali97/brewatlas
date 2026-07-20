import Image from "next/image";
import Link from "next/link";
import { surfaces } from "@/lib/constants/styles";
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
    case "liked_recipe":
      return recipe
        ? translate(dictionary, "communityPage.activityLikedTemplate", { actor, recipe })
        : translate(dictionary, "communityPage.activityLikedGeneric", { actor });
    case "commented_recipe":
      return recipe
        ? translate(dictionary, "communityPage.activityCommentedTemplate", { actor, recipe })
        : translate(dictionary, "communityPage.activityCommentedGeneric", { actor });
    case "completed_brew_session":
      return translate(dictionary, "communityPage.activityBrewSessionTemplate", { actor });
    case "official_recipe_published":
      return translate(dictionary, "communityPage.activityOfficialTemplate", { actor });
    case "admin_featured_recipe":
      return recipe
        ? translate(dictionary, "communityPage.activityFeaturedTemplate", { actor, recipe })
        : translate(dictionary, "communityPage.activityGeneric", { actor });
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
      <div className="rounded-[1.25rem] border border-ba-espresso/08 bg-ba-sand/30 px-6 py-12 text-center">
        <p className="text-sm text-ac-espresso">{labels.noActivityYet}</p>
      </div>
    );
  }

  return (
    <ul className={`divide-y divide-ba-espresso/[0.06] overflow-hidden ${surfaces.lightList}`}>
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-4 px-5 py-4 sm:px-6">
          <Link href={`/users/${item.user.id}`} className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-ba-espresso/12 bg-ba-sand/40">
            {item.user.avatarUrl ? (
              <Image src={item.user.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-ac-espresso">
                {(item.user.displayName ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ac-espresso">{activityLabel(item, dictionary)}</p>
            <time dateTime={item.createdAt} className="mt-1 block text-xs text-ac-espresso">
              {formatTime(item.createdAt, locale)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}

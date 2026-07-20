import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { CommunityActivityFeed } from "@/app/components/profile/community-activity-feed";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { getFollowingActivityFeed } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/community/following",
    locale,
    title: dictionary.communityPlatformPage.followingFeedTitle,
    description: dictionary.communityPage.description,
    noIndex: true,
  });
}

export default async function CommunityFollowingPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const cp = dictionary.communityPlatformPage;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent("/community/following")}`);
  }

  const feed = await getFollowingActivityFeed(supabase, authData.user.id, 30);

  return (
    <SectionFrame id="community-following" ariaLabelledBy="following-feed-heading" padding="compact">
      <PageHeader
        headingId="following-feed-heading"
        eyebrow={dictionary.community.title}
        title={cp.followingFeedTitle}
        description={dictionary.communityPage.description}
      />

      <CommunityActivityFeed items={feed} dictionary={dictionary} locale={locale} />

      <div className="mt-10">
        <Link href="/community" className={`${acTypography.nav} text-ac-espresso hover:text-ba-bronze ${acFocus.ring}`}>
          ← {dictionary.community.title}
        </Link>
      </div>
    </SectionFrame>
  );
}

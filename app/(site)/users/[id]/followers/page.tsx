import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { ProfileConnectionList } from "@/app/components/community/profile-connection-list";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { getFollowers, getPublicProfile } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { interpolate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const profile = await getPublicProfile(supabase, id);
  if (!profile) {
    return { title: dictionary.publicProfilePage.notFoundTitle, robots: { index: false, follow: false } };
  }
  const displayName = profile.displayName ?? dictionary.publicProfilePage.anonymousMember;
  return buildLocalizedMetadata({
    pathname: `/users/${id}/followers`,
    locale,
    title: `${dictionary.communityPlatformPage.followersTitle} · ${displayName}`,
    description: interpolate(dictionary.metadata.publicProfileDescriptionTemplate, { name: displayName }),
    noIndex: true,
  });
}

export default async function UserFollowersPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const cp = dictionary.communityPlatformPage;
  const labels = dictionary.publicProfilePage;
  const supabase = await createClient();
  const profile = await getPublicProfile(supabase, id);
  if (!profile) notFound();

  const followers = await getFollowers(supabase, id, { limit: 100 });
  const displayName = profile.displayName ?? labels.anonymousMember;

  return (
    <SectionFrame id="user-followers" ariaLabelledBy="followers-heading" padding="compact">
      <PageHeader
        headingId="followers-heading"
        eyebrow={displayName}
        title={cp.followersTitle}
        description={interpolate(labels.followersCountTemplate, { count: profile.stats.followersCount })}
      />
      <ProfileConnectionList
        profiles={followers}
        emptyMessage={dictionary.communityPage.noActivityYet}
        anonymousLabel={labels.anonymousMember}
      />
      <div className="mt-8">
        <Link href={`/users/${id}`} className={`${acTypography.nav} text-ac-espresso hover:text-ba-bronze ${acFocus.ring}`}>
          ← {displayName}
        </Link>
      </div>
    </SectionFrame>
  );
}

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { surfaces } from "@/lib/constants/styles";
import type { ProfileSummary } from "@/types/community";

type ProfileConnectionListProps = {
  profiles: ProfileSummary[];
  emptyMessage: string;
  anonymousLabel: string;
};

export function ProfileConnectionList({ profiles, emptyMessage, anonymousLabel }: ProfileConnectionListProps) {
  if (profiles.length === 0) {
    return <p className="text-sm text-ac-espresso">{emptyMessage}</p>;
  }

  return (
    <ul className={`divide-y divide-ba-espresso/[0.06] overflow-hidden ${surfaces.lightList}`}>
      {profiles.map((profile) => (
        <li key={profile.id}>
          <Link
            href={`/users/${profile.id}`}
            className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-ba-sand/20 sm:px-6"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-ba-espresso/12 bg-ba-sand/40">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt="" fill sizes="48px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-medium text-ac-espresso">
                  {(profile.displayName ?? anonymousLabel).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-ac-espresso">{profile.displayName ?? anonymousLabel}</p>
              {profile.country ? (
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ac-espresso">
                  <MapPin className="h-3 w-3 text-amber-500/80" aria-hidden />
                  {profile.country}
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

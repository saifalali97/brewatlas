"use client";

import { Invitation } from "@/app/components/atlas/invitation";

type GuestArchiveInvitationProps = {
  title: string;
  description: string;
  signInHref: string;
  signInLabel: string;
  premiumHref: string;
  premiumLabel: string;
};

/** Guest paywall — letter invitation inset, not a promo card. */
export function GuestArchiveInvitation({
  title,
  description,
  signInHref,
  signInLabel,
  premiumHref,
  premiumLabel,
}: GuestArchiveInvitationProps) {
  return (
    <div className="mt-20 border-t border-ac-espresso/[0.08] pt-20">
      <Invitation
        eyebrow="The Library"
        title={title}
        prose={<p>{description}</p>}
        ctaHref={signInHref}
        ctaLabel={signInLabel}
        secondaryHref={premiumHref}
        secondaryLabel={premiumLabel}
        dark={false}
        className="mx-0 max-w-2xl"
      />
    </div>
  );
}

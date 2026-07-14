import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons } from "@/lib/constants/styles";

/**
 * Precached by `public/sw.js` and served whenever a navigation request
 * fails with no cached page available (PWA requirement 5: offline
 * fallback). Kept out of the sitemap and disallowed in `robots.ts`
 * since it's a utility page, not indexable content.
 */
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "You're Offline",
  description: "BrewAtlas can't reach the network right now.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <SectionFrame id="offline-page" ariaLabelledBy="offline-page-heading" padding="compact">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-600/25 bg-amber-950/40">
          <WifiOff className="h-6 w-6 text-amber-500/85" aria-hidden />
        </div>

        <div className="mt-6">
          <PageHeader
            eyebrow="No Connection"
            title="You're Offline"
            description="We couldn't reach BrewAtlas. Check your connection and try again — pages you've already visited are still available offline."
          />
        </div>

        <RippleLink href="/" className={`${buttons.primary} w-full sm:w-auto`}>
          Try Again
        </RippleLink>
      </div>
    </SectionFrame>
  );
}

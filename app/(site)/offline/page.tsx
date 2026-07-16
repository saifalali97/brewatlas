import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons } from "@/lib/constants/styles";
import en from "@/lib/i18n/dictionaries/en";

/**
 * Precached by `public/sw.js` and served whenever a navigation request
 * fails with no cached page available (PWA requirement 5: offline
 * fallback). Kept out of the sitemap and disallowed in `robots.ts`
 * since it's a utility page, not indexable content.
 *
 * This route stays `force-static` (precached at build time by the
 * service worker, with no per-request cookie access), so it can't call
 * `getLocale()`/`getDictionary()` like other pages -- it always renders
 * the English copy, matching the app's default locale. Once the user
 * is back online, every other page still renders in their selected
 * language via the cookie-based locale system.
 */
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: en.offlinePage.metaTitle,
  description: en.offlinePage.metaDescription,
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  const o = en.offlinePage;

  return (
    <SectionFrame id="offline-page" ariaLabelledBy="offline-page-heading" padding="compact">
      
<div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-600/25 bg-amber-950/40">
          <WifiOff className="h-6 w-6 text-amber-500/85" aria-hidden />
        </div>

        <div className="mt-6">
          <PageHeader headingId="offline-page-heading" eyebrow={o.eyebrow} title={o.title} description={o.description} />
        </div>

        <RippleLink href="/" className={`${buttons.primary} w-full sm:w-auto`}>
          {o.tryAgainCta}
        </RippleLink>
      </div>
    </SectionFrame>
  );
}

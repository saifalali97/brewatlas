import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import en from "@/lib/i18n/dictionaries/en";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: en.offlinePage.metaTitle,
  description: en.offlinePage.metaDescription,
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  const o = en.offlinePage;

  return (
    <main
      id="main-content"
      className="flex min-h-[70svh] flex-col items-center justify-center bg-ac-limestone px-6 py-24 text-center"
    >
      <div className="mb-6 flex h-12 w-12 items-center justify-center text-ac-copper">
        <WifiOff className="h-6 w-6" aria-hidden />
      </div>
      <p className={acTypography.eyebrow}>{o.eyebrow}</p>
      <h1 className={`${acTypography.displayLg} mt-6 max-w-lg`}>{o.title}</h1>
      <p className={`${acTypography.body} mx-auto mt-6 max-w-md`}>{o.description}</p>
      <Link
        href="/"
        className={`${acTypography.nav} mt-10 inline-flex h-12 items-center rounded-full border border-ac-copper/40 px-8 text-ac-espresso hover:border-ac-copper/60 hover:bg-ac-espresso/[0.04] ${acFocus.ring}`}
      >
        {o.tryAgainCta}
      </Link>
    </main>
  );
}

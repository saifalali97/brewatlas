import type { Metadata } from "next";
import Link from "next/link";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { PAGE_EDITORIAL_IMAGES } from "@/lib/media/page-images";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/404",
    locale,
    title: dictionary.metadata.notFoundTitle,
    description: dictionary.metadata.notFoundDescription,
    noIndex: true,
  });
}

export default async function SiteNotFound() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const e = dictionary.errorPages;

  return (
    <main
      id="main-content"
      className="flex min-h-[70svh] flex-col items-center justify-center bg-ac-limestone px-6 py-24 text-center"
    >
      <div className="relative mb-10 aspect-[16/10] w-full max-w-lg overflow-hidden rounded-sm">
        <OptimizedImage
          src={PAGE_EDITORIAL_IMAGES.notFound}
          alt=""
          fill
          sizes="512px"
          className="object-cover object-center"
          priority
        />
      </div>
      <p className={acTypography.eyebrow}>404</p>
      <h1 className={`${acTypography.displayLg} mt-6 max-w-lg`}>{e.notFoundTitle}</h1>
      <p className={`${acTypography.body} mx-auto mt-6 max-w-md`}>{e.notFoundDescription}</p>
      <Link
        href="/"
        className={`${acTypography.nav} mt-10 inline-flex h-12 items-center rounded-full border border-ac-copper/40 px-8 text-ac-espresso hover:border-ac-copper/60 hover:bg-ac-espresso/[0.04] ${acFocus.ring}`}
      >
        {e.notFoundCta}
      </Link>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { buttons, dsTypography } from "@/lib/constants/styles";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
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

export default async function NotFound() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const e = dictionary.errorPages;

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ba-ivory px-6 py-24 text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(184,149,107,0.1),transparent)]"
      />
      <p className={dsTypography.eyebrow}>404</p>
      <h1 className={`mt-5 max-w-lg ${dsTypography.h1}`}>{e.notFoundTitle}</h1>
      <p className={`mt-5 max-w-md ${dsTypography.body}`}>{e.notFoundDescription}</p>
      <Link href="/" className={`${buttons.primary} mt-10 min-w-[200px]`}>
        {e.notFoundCta}
      </Link>
    </main>
  );
}

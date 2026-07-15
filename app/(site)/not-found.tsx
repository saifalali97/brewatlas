import type { Metadata } from "next";
import Link from "next/link";
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

export default async function SiteNotFound() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const e = dictionary.errorPages;

  return (
    <main
      id="main-content"
      className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center text-stone-100"
    >
      <h1 className="text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">{e.notFoundTitle}</h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-stone-400">{e.notFoundDescription}</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-stone-50 px-8 text-sm font-medium text-stone-900 transition-all duration-300 hover:bg-stone-200"
      >
        {e.notFoundCta}
      </Link>
    </main>
  );
}

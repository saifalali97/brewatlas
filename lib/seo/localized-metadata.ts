import type { Metadata } from "next";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { resolveAbsoluteAssetUrl } from "@/lib/seo/path-utils";
import { getSiteUrl, siteConfig } from "@/lib/seo/site";
import { LOCALE_METADATA, type Locale } from "@/types/i18n";

/**
 * Localized SEO helpers (requirement 6). BrewAtlas resolves locale from
 * a cookie/`Accept-Language` rather than a URL path segment (see
 * `lib/i18n/locale.ts`, `proxy.ts`) so every route's file structure and
 * component hierarchy stays untouched. To still give search engines a
 * distinct, crawlable URL per language for hreflang -- which requires
 * genuinely different URLs, not just different cookies -- non-default
 * locales are addressed with a `?lang=<locale>` query parameter that
 * `proxy.ts` honors as an explicit override. The default locale ("en")
 * keeps the plain, unparameterized URL as its canonical form.
 */

export function localizedPathUrl(pathname: string, locale: Locale): string {
  const siteUrl = getSiteUrl();
  const normalizedPath = pathname === "/" ? "" : pathname;
  const base = `${siteUrl}${normalizedPath || "/"}`;
  return locale === DEFAULT_LOCALE ? base : `${base}${base.includes("?") ? "&" : "?"}lang=${locale}`;
}

/** hreflang alternates for every supported locale, plus `x-default` pointing at the default-locale URL, keyed by BCP-47 tag as `generateMetadata`'s `alternates.languages` (and `app/sitemap.ts`) expect. */
export function buildHreflangAlternates(pathname: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of SUPPORTED_LOCALES) {
    languages[LOCALE_METADATA[locale].bcp47] = localizedPathUrl(pathname, locale);
  }
  languages["x-default"] = localizedPathUrl(pathname, DEFAULT_LOCALE);
  return languages;
}

export type LocalizedMetadataInput = {
  /** Site-relative pathname, e.g. `"/culture/arabic-coffee"` (no locale prefix -- BrewAtlas doesn't use one). */
  pathname: string;
  locale: Locale;
  title: string;
  description: string;
  ogImage?: { url: string; width?: number; height?: number; alt?: string };
  openGraphType?: "website" | "article";
  /** Set for account-only utility pages (login, signup, password reset) that shouldn't be indexed. */
  noIndex?: boolean;
};

function defaultOgImage() {
  return {
    url: resolveAbsoluteAssetUrl(siteConfig.ogImage.url),
    width: siteConfig.ogImage.width,
    height: siteConfig.ogImage.height,
    alt: siteConfig.ogImage.alt,
  };
}

function resolveOgImages(ogImage?: LocalizedMetadataInput["ogImage"]) {
  if (ogImage?.url) {
    return [
      {
        url: resolveAbsoluteAssetUrl(ogImage.url),
        width: ogImage.width,
        height: ogImage.height,
        alt: ogImage.alt ?? siteConfig.ogImage.alt,
      },
    ];
  }
  return [defaultOgImage()];
}

/** Builds a `generateMetadata()` result with a locale-correct canonical URL, full hreflang alternates, and localized OpenGraph/Twitter tags. */
export function buildLocalizedMetadata({
  pathname,
  locale,
  title,
  description,
  ogImage,
  openGraphType = "website",
  noIndex,
}: LocalizedMetadataInput): Metadata {
  const canonical = localizedPathUrl(pathname, locale);
  const localeMeta = LOCALE_METADATA[locale];
  const images = resolveOgImages(ogImage);
  const twitterImages = images.map((image) => ({ url: image.url, alt: image.alt }));

  return {
    title,
    description,
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical,
      languages: buildHreflangAlternates(pathname),
    },
    openGraph: {
      type: openGraphType,
      locale: localeMeta.bcp47.replace("-", "_"),
      siteName: siteConfig.name,
      url: canonical,
      title,
      description,
      images,
    },
    twitter: {
      card: siteConfig.twitter.card,
      site: siteConfig.twitter.site,
      creator: siteConfig.twitter.creator,
      title,
      description,
      images: twitterImages,
    },
  };
}

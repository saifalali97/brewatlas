import { localizedPathUrl } from "@/lib/seo/localized-metadata";
import { resolveAbsoluteAssetUrl } from "@/lib/seo/path-utils";
import { getSiteUrl, siteConfig } from "@/lib/seo/site";
import type { Locale } from "@/types/i18n";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildCollectionPageJsonLd(input: {
  url: string;
  name: string;
  description: string;
  itemCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: input.url,
    name: input.name,
    description: input.description,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.itemCount,
    },
  };
}

export type ArticleJsonLdInput = {
  url: string;
  headline: string;
  description: string;
  image?: string | null;
  datePublished?: string;
  dateModified?: string;
  type?: "Article" | "BlogPosting";
};

export function buildArticleJsonLd(input: ArticleJsonLdInput) {
  const siteUrl = getSiteUrl();
  const schemaType = input.type ?? "Article";

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: input.headline,
    description: input.description,
    url: input.url,
    mainEntityOfPage: input.url,
    ...(input.image ? { image: resolveAbsoluteAssetUrl(input.image) } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.svg`,
      },
    },
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[], locale: Locale = "en") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: localizedPathUrl(item.path, locale),
    })),
  };
}

export type PopularDestinationLink = {
  name: string;
  path: string;
};

/** ItemList of popular site destinations for the base search page (no UI change). */
export function buildPopularDestinationsJsonLd(destinations: PopularDestinationLink[], locale: Locale = "en") {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Popular BrewAtlas destinations",
    itemListElement: destinations.map((destination, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: destination.name,
      url: localizedPathUrl(destination.path, locale),
    })),
  };
}

export function getJsonLdGraph() {
  const siteUrl = getSiteUrl();
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.name,
        url: siteUrl,
        description: siteConfig.description,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/icon.svg`,
          width: 32,
          height: 32,
        },
        founder: {
          "@type": "Person",
          name: siteConfig.creator,
          url: siteConfig.authors[0]?.url,
        },
        sameAs: ["https://github.com/saifalali97"],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": organizationId },
        inLanguage: ["en-US", "ar"],
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

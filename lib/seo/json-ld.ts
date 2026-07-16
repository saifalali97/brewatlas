import { getSiteUrl, siteConfig } from "@/lib/seo/site";

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
        inLanguage: "en-US",
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

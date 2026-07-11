import { getSiteUrl, siteConfig } from "@/lib/seo/site";

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
            urlTemplate: `${siteUrl}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

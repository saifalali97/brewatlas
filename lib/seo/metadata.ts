import type { Metadata } from "next";
import { getSiteUrl, siteConfig } from "@/lib/seo/site";

export function createSiteMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: siteConfig.title,
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    authors: [...siteConfig.authors],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    applicationName: siteConfig.applicationName,
    category: siteConfig.category,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: siteUrl,
      siteName: siteConfig.name,
      title: siteConfig.title.default,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
    },
    twitter: {
      card: siteConfig.twitter.card,
      site: siteConfig.twitter.site,
      creator: siteConfig.twitter.creator,
      title: siteConfig.title.default,
      description: siteConfig.description,
      images: [
        {
          url: siteConfig.ogImage.url,
          alt: siteConfig.ogImage.alt,
        },
      ],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
    },
    manifest: "/manifest.webmanifest",
  };
}

import type { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export function buildAdminMetadata(title: string, description: string, pathname: string): Metadata {
  return buildLocalizedMetadata({
    pathname,
    locale: "en",
    title: `${title} | BrewAtlas Admin`,
    description,
    noIndex: true,
  });
}

import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

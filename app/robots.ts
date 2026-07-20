import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/auth",
        "/account",
        "/admin",
        "/dashboard",
        "/offline",
        "/ai-coach",
        "/api/",
      ],
    },
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";
import { getAllRecipeSlugs } from "@/lib/data/recipes";
import { getSiteUrl } from "@/lib/seo/site";

/** Public App Router pages included in the sitemap. */
const publicPages: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/recipes", changeFrequency: "weekly", priority: 0.9 },
  { path: "/methods", changeFrequency: "monthly", priority: 0.8 },
  { path: "/origins", changeFrequency: "monthly", priority: 0.8 },
  { path: "/roasters", changeFrequency: "monthly", priority: 0.8 },
  { path: "/devices", changeFrequency: "monthly", priority: 0.7 },
  { path: "/premium", changeFrequency: "monthly", priority: 0.8 },
  { path: "/culture", changeFrequency: "monthly", priority: 0.7 },
  { path: "/culture/uae-coffee-culture", changeFrequency: "monthly", priority: 0.6 },
  { path: "/culture/arabic-coffee", changeFrequency: "monthly", priority: 0.6 },
  { path: "/culture/tea", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "yearly", priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
];

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  const staticEntries = publicPages.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? baseUrl : `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  const recipeEntries = getAllRecipeSlugs().map((slug) => ({
    url: `${baseUrl}/recipes/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...recipeEntries];
}

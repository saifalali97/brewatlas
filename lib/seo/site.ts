export const siteConfig = {
  name: "BrewAtlas",
  shortName: "BrewAtlas",
  title: {
    default: "BrewAtlas — Specialty Coffee Recipes",
    template: "%s | BrewAtlas",
  },
  description:
    "The world's largest specialty coffee recipe platform. Explore curated recipes, coffee origins, brew methods, top roasters, and premium barista tools.",
  keywords: [
    "specialty coffee",
    "coffee recipes",
    "brew methods",
    "pour over",
    "espresso",
    "coffee origins",
    "barista",
    "V60",
    "Chemex",
    "Aeropress",
    "cold brew",
    "coffee roasters",
    "brew atlas",
    "coffee brewing",
    "third wave coffee",
  ],
  authors: [{ name: "Saif Alali", url: "https://github.com/saifalali97" }],
  creator: "Saif Alali",
  publisher: "BrewAtlas",
  applicationName: "BrewAtlas",
  category: "food and drink",
  locale: "en_US",
  themeColor: "#150e09",
  ogImage: {
    url: "/images/recipes/ethiopian-pour-over.png",
    width: 1536,
    height: 1024,
    alt: "Ethiopian pour-over specialty coffee recipe on BrewAtlas",
    type: "image/png",
  },
  twitter: {
    card: "summary_large_image" as const,
    creator: "@saifalali97",
    site: "@brewatlas",
  },
} as const;

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.brewatlas.app";
  return url.replace(/\/$/, "");
}

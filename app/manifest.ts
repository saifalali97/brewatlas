import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/site";

/**
 * Web App Manifest (PWA requirement 2). `sizes`/`purpose` cover both
 * regular ("any") and maskable icon slots so Android/Chrome can safely
 * crop the icon into a circle/squircle without clipping the glyph --
 * see the route handlers under `app/icons/` for how each PNG is generated.
 *
 * A dedicated splash-screen image isn't needed: Android/Chrome derive
 * the install splash from `background_color` + the largest icon here,
 * and iOS 15+ does the same from `theme-color` + the `apple-icon`
 * (see `app/apple-icon.tsx` and the `appleWebApp` metadata in
 * `lib/seo/metadata.ts`) -- both already match the app's dark brand
 * background, so no separate per-device splash assets are generated.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    lang: "en",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: siteConfig.themeColor,
    theme_color: siteConfig.themeColor,
    categories: ["food", "lifestyle"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      {
        src: "/icons/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Browse Recipes",
        url: "/recipes",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      {
        name: "Dashboard",
        url: "/account",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
    ],
  };
}

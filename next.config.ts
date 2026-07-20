import path from "node:path";
import type { NextConfig } from "next";
import {
  documentCacheHeaders,
  securityHeaders,
  serviceWorkerCacheHeaders,
  staticAssetCacheHeaders,
} from "./lib/security/headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.31.186"],
  turbopack: {
    // Pin the workspace root so Turbopack doesn't fall back to a parent
    // directory when it finds another lockfile above this project.
    root: path.resolve(__dirname),
  },
  images: {
    deviceSizes: [480, 640, 750, 960, 1080, 1200, 1600, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 160, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "veqpzeatgpfwuygfbnxc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      // Raised from the 1MB default so profile avatar uploads and recipe
      // cover/gallery photo uploads (routed through Server Actions to
      // Supabase Storage) have room to breathe.
      bodySizeLimit: "20mb",
    },
  },
  async headers() {
    return [
      {
        // HTML/app routes only — never attach CSP to hashed build assets.
        source:
          "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2|js|css)$).*)",
        headers: securityHeaders,
      },
      {
        source: "/",
        headers: documentCacheHeaders,
      },
      {
        source: "/images/:path*",
        headers: staticAssetCacheHeaders,
      },
      {
        source: "/icon.svg",
        headers: staticAssetCacheHeaders,
      },
      {
        source: "/favicon.ico",
        headers: staticAssetCacheHeaders,
      },
      {
        source: "/sw.js",
        headers: serviceWorkerCacheHeaders,
      },
      {
        source: "/icons/:path*",
        headers: staticAssetCacheHeaders,
      },
    ];
  },
};

export default nextConfig;

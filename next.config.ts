import type { NextConfig } from "next";
import {
  documentCacheHeaders,
  securityHeaders,
  staticAssetCacheHeaders,
} from "./lib/security/headers";

const seoRouteHeaders = [
  {
    source: "/sitemap.xml",
    headers: [
      { key: "Content-Type", value: "application/xml; charset=utf-8" },
      ...documentCacheHeaders,
    ],
  },
  {
    source: "/robots.txt",
    headers: [
      { key: "Content-Type", value: "text/plain; charset=utf-8" },
      ...documentCacheHeaders,
    ],
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      ...seoRouteHeaders,
      {
        source: "/:path*",
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
    ];
  },
};

export default nextConfig;

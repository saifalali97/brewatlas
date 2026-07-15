const UNSPLASH_ORIGIN = "https://images.unsplash.com";
const isDev = process.env.NODE_ENV !== "production";

function getSupabaseOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

const supabaseOrigin = getSupabaseOrigin();
const connectSrc = ["'self'", "https://api.stripe.com", ...(supabaseOrigin ? [supabaseOrigin] : [])].join(" ");
const imgSrc = ["'self'", "data:", "blob:", UNSPLASH_ORIGIN, ...(supabaseOrigin ? [supabaseOrigin] : [])].join(" ");

// React/Next.js dev mode uses eval() in the browser to reconstruct stack
// traces for the error overlay and Fast Refresh — it is never used in a
// production build. We only relax `script-src` with `unsafe-eval` for local
// development so the production CSP stays fully locked down.
// `upgrade-insecure-requests` must NOT be sent when the page is served over
// plain HTTP (e.g. `next start -H 0.0.0.0` on a LAN IP). Safari upgrades
// every script URL to HTTPS, TLS fails, and zero client JS runs (SSR-only).
// Production HTTPS is enforced via hosting + HSTS below.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src ${imgSrc}`,
  "font-src 'self'",
  `connect-src ${connectSrc}`,
  "media-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
].join("; ");

export const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

export const staticAssetCacheHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=31536000, immutable",
  },
];

export const documentCacheHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=0, must-revalidate",
  },
];

/**
 * Headers for the PWA service worker script (`public/sw.js`). Never
 * cached by the browser's HTTP cache -- `sw.js` itself is how the app
 * ships updates (see `CACHE_VERSION` in that file), so a stale
 * `sw.js` response would silently pin users to an old cache forever.
 */
export const serviceWorkerCacheHeaders = [
  { key: "Content-Type", value: "application/javascript; charset=utf-8" },
  { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
  { key: "Service-Worker-Allowed", value: "/" },
];

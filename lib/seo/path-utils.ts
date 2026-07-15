/** Normalizes a site-relative path or absolute URL to a pathname for SEO helpers. */
export function resolveSitePathname(pathOrUrl: string, fallback: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed.split("?")[0] ?? fallback;
  }

  try {
    return new URL(trimmed).pathname || fallback;
  } catch {
    return fallback;
  }
}

/** Resolves relative asset paths against the public site URL for Open Graph images. */
export function resolveAbsoluteAssetUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.brewatlas.app";
  return `${siteUrl}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

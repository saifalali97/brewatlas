import type { GulfHeritageCmsRecordBase, GulfHeritageContentStatus } from "@/types/gulf-heritage-cms";
import type { Locale } from "@/types/i18n";

/** Static registry baseline timestamp — updated when editorial content changes. */
export const STATIC_GULF_HERITAGE_CMS_TIMESTAMP = "2026-07-19T00:00:00.000Z";

export function createStaticCmsBase(
  entity: string,
  slug: string,
  locale: Locale,
  status: GulfHeritageContentStatus = "published",
): GulfHeritageCmsRecordBase {
  return {
    id: `gh:${entity}:${slug}:${locale}`,
    slug,
    status,
    publishedAt: STATIC_GULF_HERITAGE_CMS_TIMESTAMP,
    updatedAt: STATIC_GULF_HERITAGE_CMS_TIMESTAMP,
    createdAt: STATIC_GULF_HERITAGE_CMS_TIMESTAMP,
    locale,
  };
}

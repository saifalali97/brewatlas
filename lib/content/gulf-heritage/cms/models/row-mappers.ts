import type {
  GulfHeritageArticleRecord,
  GulfHeritageArticleRow,
  GulfHeritageCategoryRecord,
  GulfHeritageCategoryRow,
  GulfHeritageCountryRecord,
  GulfHeritageCountryRow,
  GulfHeritageImageRecord,
  GulfHeritageImageRow,
  GulfHeritageRecipeRecord,
  GulfHeritageRecipeRow,
  GulfHeritageReferenceRecord,
  GulfHeritageReferenceRow,
  GulfHeritageRoasterRecord,
  GulfHeritageRoasterRow,
} from "@/types/gulf-heritage-cms";

/** Map Supabase snake_case rows to application CMS records (for future repository implementations). */
export function mapGulfHeritageCountryRow(row: GulfHeritageCountryRow): GulfHeritageCountryRecord {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    locale: row.locale,
    heroImageUrl: row.hero_image_url,
    name: row.name,
    description: row.description,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

export function mapGulfHeritageCategoryRow(row: GulfHeritageCategoryRow): GulfHeritageCategoryRecord {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    locale: row.locale,
    countrySlug: row.country_slug,
    title: row.title,
    description: row.description,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    pageSlugs: row.page_slugs,
    sortOrder: row.sort_order,
  };
}

export function mapGulfHeritageArticleRow(row: GulfHeritageArticleRow): GulfHeritageArticleRecord {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    locale: row.locale,
    countrySlug: row.country_slug,
    categorySlug: row.category_slug,
    editorialStatus: row.editorial_status,
    title: row.title,
    intro: row.intro,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    relatedPageSlugs: row.related_page_slugs,
    relatedRecipeSlugs: row.related_recipe_slugs,
    content: row.content,
  };
}

export function mapGulfHeritageRoasterRow(row: GulfHeritageRoasterRow): GulfHeritageRoasterRecord {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    locale: row.locale,
    countrySlug: row.country_slug,
    categorySlug: row.category_slug,
    editorialStatus: row.editorial_status,
    title: row.title,
    intro: row.intro,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    relatedPageSlugs: row.related_page_slugs,
    relatedRecipeSlugs: row.related_recipe_slugs,
    profile: row.profile,
  };
}

export function mapGulfHeritageRecipeRow(row: GulfHeritageRecipeRow): GulfHeritageRecipeRecord {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    locale: row.locale,
    countrySlug: row.country_slug,
    pageSlug: row.page_slug,
    recipe: row.recipe,
  };
}

export function mapGulfHeritageReferenceRow(row: GulfHeritageReferenceRow): GulfHeritageReferenceRecord {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    locale: row.locale,
    countrySlug: row.country_slug,
    pageSlug: row.page_slug,
    reference: row.reference,
    sortOrder: row.sort_order,
  };
}

export function mapGulfHeritageImageRow(row: GulfHeritageImageRow): GulfHeritageImageRecord {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    locale: row.locale,
    countrySlug: row.country_slug,
    pageSlug: row.page_slug,
    images: row.images,
  };
}

/** Inverse mappers for future write operations. */
export function toGulfHeritageCountryRow(record: GulfHeritageCountryRecord): GulfHeritageCountryRow {
  return {
    id: record.id,
    slug: record.slug,
    status: record.status,
    published_at: record.publishedAt,
    updated_at: record.updatedAt,
    created_at: record.createdAt,
    locale: record.locale,
    hero_image_url: record.heroImageUrl,
    name: record.name,
    description: record.description,
    seo_title: record.seoTitle,
    seo_description: record.seoDescription,
  };
}

export function toGulfHeritageCategoryRow(
  record: GulfHeritageCategoryRecord,
  countryId: string,
): GulfHeritageCategoryRow {
  return {
    id: record.id,
    slug: record.slug,
    status: record.status,
    published_at: record.publishedAt,
    updated_at: record.updatedAt,
    created_at: record.createdAt,
    locale: record.locale,
    country_id: countryId,
    country_slug: record.countrySlug,
    title: record.title,
    description: record.description,
    seo_title: record.seoTitle,
    seo_description: record.seoDescription,
    page_slugs: [...record.pageSlugs],
    sort_order: record.sortOrder,
  };
}

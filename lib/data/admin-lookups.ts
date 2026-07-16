import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export const ADMIN_LOOKUP_PAGE_SIZE = 15;

export type AdminLookupStatusFilter = "all" | "published" | "draft";

export type AdminLookupFilters = {
  search?: string;
  status?: AdminLookupStatusFilter;
  page?: number;
};

export type AdminLookupPageResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

function parseStatusFilter(status?: AdminLookupStatusFilter) {
  if (status === "published") return { column: "published", value: true } as const;
  if (status === "draft") return { column: "published", value: false } as const;
  return null;
}

export type AdminDeviceRow = {
  id: string;
  name: string;
  slug: string;
  manufacturer: string | null;
  published: boolean;
  createdAt: string;
};

export async function getAdminDevicesPage(
  supabase: SupabaseClient,
  filters: AdminLookupFilters = {},
): Promise<AdminLookupPageResult<AdminDeviceRow>> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = ADMIN_LOOKUP_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const search = filters.search?.trim() ?? "";

  let query = supabase
    .from("devices")
    .select("id, name, slug, manufacturer, published, created_at", { count: "exact" });

  const statusFilter = parseStatusFilter(filters.status);
  if (statusFilter) query = query.eq(statusFilter.column, statusFilter.value);

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,manufacturer.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("getAdminDevicesPage failed", error);
    return { items: [], totalCount: 0, page, pageSize };
  }

  return {
    items: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      manufacturer: row.manufacturer,
      published: row.published ?? true,
      createdAt: row.created_at,
    })),
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

export async function getAdminDeviceById(supabase: SupabaseClient, id: string): Promise<AdminDeviceRow | null> {
  const { data, error } = await supabase
    .from("devices")
    .select("id, name, slug, manufacturer, published, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    manufacturer: data.manufacturer,
    published: data.published ?? true,
    createdAt: data.created_at,
  };
}

export type AdminOriginRow = {
  id: string;
  country: string;
  region: string;
  description: string | null;
  published: boolean;
  createdAt: string;
};

export async function getAdminOriginsPage(
  supabase: SupabaseClient,
  filters: AdminLookupFilters = {},
): Promise<AdminLookupPageResult<AdminOriginRow>> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = ADMIN_LOOKUP_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const search = filters.search?.trim() ?? "";

  let query = supabase
    .from("origins")
    .select("id, country, region, description, published, created_at", { count: "exact" });

  const statusFilter = parseStatusFilter(filters.status);
  if (statusFilter) query = query.eq(statusFilter.column, statusFilter.value);

  if (search) {
    query = query.or(`country.ilike.%${search}%,region.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order("country", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("getAdminOriginsPage failed", error);
    return { items: [], totalCount: 0, page, pageSize };
  }

  return {
    items: (data ?? []).map((row) => ({
      id: row.id,
      country: row.country,
      region: row.region,
      description: row.description,
      published: row.published ?? true,
      createdAt: row.created_at,
    })),
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

export async function getAdminOriginById(supabase: SupabaseClient, id: string): Promise<AdminOriginRow | null> {
  const { data, error } = await supabase
    .from("origins")
    .select("id, country, region, description, published, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    country: data.country,
    region: data.region,
    description: data.description,
    published: data.published ?? true,
    createdAt: data.created_at,
  };
}

export type AdminRoasterRow = {
  id: string;
  name: string;
  slug: string | null;
  country: string | null;
  website: string | null;
  logoUrl: string | null;
  description: string | null;
  emirate: string | null;
  city: string | null;
  featured: boolean;
  isUae: boolean;
  published: boolean;
  createdAt: string;
};

export async function getAdminRoastersPage(
  supabase: SupabaseClient,
  filters: AdminLookupFilters = {},
): Promise<AdminLookupPageResult<AdminRoasterRow>> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = ADMIN_LOOKUP_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const search = filters.search?.trim() ?? "";

  let query = supabase
    .from("roasters")
    .select(
      "id, name, slug, country, website, logo_url, description, emirate, city, featured, is_uae, published, created_at",
      { count: "exact" },
    );

  const statusFilter = parseStatusFilter(filters.status);
  if (statusFilter) query = query.eq(statusFilter.column, statusFilter.value);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,country.ilike.%${search}%,slug.ilike.%${search}%,city.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query
    .order("name", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("getAdminRoastersPage failed", error);
    return { items: [], totalCount: 0, page, pageSize };
  }

  return {
    items: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      country: row.country,
      website: row.website,
      logoUrl: row.logo_url,
      description: row.description,
      emirate: row.emirate,
      city: row.city,
      featured: row.featured ?? false,
      isUae: row.is_uae ?? false,
      published: row.published ?? true,
      createdAt: row.created_at,
    })),
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

export async function getAdminRoasterById(supabase: SupabaseClient, id: string): Promise<AdminRoasterRow | null> {
  const { data, error } = await supabase
    .from("roasters")
    .select(
      "id, name, slug, country, website, logo_url, description, emirate, city, featured, is_uae, published, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    country: data.country,
    website: data.website,
    logoUrl: data.logo_url,
    description: data.description,
    emirate: data.emirate,
    city: data.city,
    featured: data.featured ?? false,
    isUae: data.is_uae ?? false,
    published: data.published ?? true,
    createdAt: data.created_at,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export { slugify };

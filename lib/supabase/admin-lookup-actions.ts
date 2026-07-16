"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";
import { requireAdmin } from "@/lib/auth/is-admin";
import { recordAdminAudit } from "@/lib/data/admin-audit";
import { slugify } from "@/lib/data/admin-lookups";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, key: string): string | null {
  const value = readString(formData, key);
  return value.length > 0 ? value : null;
}

function readBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function readId(formData: FormData): string | null {
  const value = formData.get("id");
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function gate() {
  return requireAdmin("/admin");
}

function revalidateDevices() {
  revalidatePath(ADMIN_CMS_PATHS.devices);
  revalidatePath("/devices");
}

function revalidateOrigins() {
  revalidatePath(ADMIN_CMS_PATHS.origins);
  revalidatePath("/origins");
}

function revalidateRoasters() {
  revalidatePath(ADMIN_CMS_PATHS.roasters);
  revalidatePath("/roasters");
}

export async function createAdminDeviceAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const name = readString(formData, "name");
  if (!name) {
    redirect(ADMIN_CMS_PATHS.devices);
  }

  const slug = readString(formData, "slug") || slugify(name);
  const { data, error } = await supabase
    .from("devices")
    .insert({
      name,
      slug,
      manufacturer: readOptionalString(formData, "manufacturer"),
      published: readBoolean(formData, "published"),
    })
    .select("id")
    .single();

  if (!error && data) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "device",
      targetId: data.id,
      action: "device_created",
      metadata: { name },
    });
    redirect(`${ADMIN_CMS_PATHS.devices}/${data.id}/edit`);
  }

  revalidateDevices();
  redirect(ADMIN_CMS_PATHS.devices);
}

export async function updateAdminDeviceAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateDevices();
    return;
  }

  const name = readString(formData, "name");
  const slug = readString(formData, "slug") || slugify(name);

  const { error } = await supabase
    .from("devices")
    .update({
      name,
      slug,
      manufacturer: readOptionalString(formData, "manufacturer"),
      published: readBoolean(formData, "published"),
    })
    .eq("id", id);

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "device",
      targetId: id,
      action: "device_updated",
      metadata: { name },
    });
  }

  revalidateDevices();
  redirect(`${ADMIN_CMS_PATHS.devices}/${id}/edit`);
}

export async function deleteAdminDeviceAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateDevices();
    return;
  }

  const { error } = await supabase.from("devices").delete().eq("id", id);
  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "device",
      targetId: id,
      action: "device_deleted",
    });
  }

  revalidateDevices();
  redirect(ADMIN_CMS_PATHS.devices);
}

export async function toggleAdminDevicePublishAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  const published = readBoolean(formData, "published");
  if (!id) {
    revalidateDevices();
    return;
  }

  const { error } = await supabase.from("devices").update({ published }).eq("id", id);
  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "device",
      targetId: id,
      action: published ? "device_published" : "device_unpublished",
    });
  }

  revalidateDevices();
}

export async function createAdminOriginAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const country = readString(formData, "country");
  const region = readString(formData, "region");
  if (!country || !region) {
    redirect(ADMIN_CMS_PATHS.origins);
  }

  const { data, error } = await supabase
    .from("origins")
    .insert({
      country,
      region,
      description: readOptionalString(formData, "description"),
      published: readBoolean(formData, "published"),
    })
    .select("id")
    .single();

  if (!error && data) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "origin",
      targetId: data.id,
      action: "origin_created",
      metadata: { country, region },
    });
    redirect(`${ADMIN_CMS_PATHS.origins}/${data.id}/edit`);
  }

  revalidateOrigins();
  redirect(ADMIN_CMS_PATHS.origins);
}

export async function updateAdminOriginAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateOrigins();
    return;
  }

  const country = readString(formData, "country");
  const region = readString(formData, "region");

  const { error } = await supabase
    .from("origins")
    .update({
      country,
      region,
      description: readOptionalString(formData, "description"),
      published: readBoolean(formData, "published"),
    })
    .eq("id", id);

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "origin",
      targetId: id,
      action: "origin_updated",
      metadata: { country, region },
    });
  }

  revalidateOrigins();
  redirect(`${ADMIN_CMS_PATHS.origins}/${id}/edit`);
}

export async function deleteAdminOriginAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateOrigins();
    return;
  }

  const { error } = await supabase.from("origins").delete().eq("id", id);
  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "origin",
      targetId: id,
      action: "origin_deleted",
    });
  }

  revalidateOrigins();
  redirect(ADMIN_CMS_PATHS.origins);
}

export async function toggleAdminOriginPublishAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  const published = readBoolean(formData, "published");
  if (!id) {
    revalidateOrigins();
    return;
  }

  const { error } = await supabase.from("origins").update({ published }).eq("id", id);
  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "origin",
      targetId: id,
      action: published ? "origin_published" : "origin_unpublished",
    });
  }

  revalidateOrigins();
}

export async function createAdminRoasterAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const name = readString(formData, "name");
  if (!name) {
    redirect(ADMIN_CMS_PATHS.roasters);
  }

  const slug = readOptionalString(formData, "slug") ?? slugify(name);
  const { data, error } = await supabase
    .from("roasters")
    .insert({
      name,
      slug,
      country: readOptionalString(formData, "country"),
      website: readOptionalString(formData, "website"),
      logo_url: readOptionalString(formData, "logoUrl"),
      description: readOptionalString(formData, "description"),
      emirate: readOptionalString(formData, "emirate"),
      city: readOptionalString(formData, "city"),
      featured: readBoolean(formData, "featured"),
      is_uae: readBoolean(formData, "isUae"),
      published: readBoolean(formData, "published"),
    })
    .select("id")
    .single();

  if (!error && data) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "roaster",
      targetId: data.id,
      action: "roaster_created",
      metadata: { name },
    });
    redirect(`${ADMIN_CMS_PATHS.roasters}/${data.id}/edit`);
  }

  revalidateRoasters();
  redirect(ADMIN_CMS_PATHS.roasters);
}

export async function updateAdminRoasterAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateRoasters();
    return;
  }

  const name = readString(formData, "name");
  const { error } = await supabase
    .from("roasters")
    .update({
      name,
      slug: readOptionalString(formData, "slug") ?? slugify(name),
      country: readOptionalString(formData, "country"),
      website: readOptionalString(formData, "website"),
      logo_url: readOptionalString(formData, "logoUrl"),
      description: readOptionalString(formData, "description"),
      emirate: readOptionalString(formData, "emirate"),
      city: readOptionalString(formData, "city"),
      featured: readBoolean(formData, "featured"),
      is_uae: readBoolean(formData, "isUae"),
      published: readBoolean(formData, "published"),
    })
    .eq("id", id);

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "roaster",
      targetId: id,
      action: "roaster_updated",
      metadata: { name },
    });
  }

  revalidateRoasters();
  redirect(`${ADMIN_CMS_PATHS.roasters}/${id}/edit`);
}

export async function deleteAdminRoasterAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  if (!id) {
    revalidateRoasters();
    return;
  }

  const { error } = await supabase.from("roasters").delete().eq("id", id);
  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "roaster",
      targetId: id,
      action: "roaster_deleted",
    });
  }

  revalidateRoasters();
  redirect(ADMIN_CMS_PATHS.roasters);
}

export async function toggleAdminRoasterPublishAction(formData: FormData): Promise<void> {
  const { supabase, user } = await gate();
  const id = readId(formData);
  const published = readBoolean(formData, "published");
  if (!id) {
    revalidateRoasters();
    return;
  }

  const { error } = await supabase.from("roasters").update({ published }).eq("id", id);
  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "roaster",
      targetId: id,
      action: published ? "roaster_published" : "roaster_unpublished",
    });
  }

  revalidateRoasters();
}

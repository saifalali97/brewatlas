import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminAuditLogEntry, AdminAuditTargetType, DbAdminAuditLogRow } from "@/types/admin";

export const ADMIN_AUDIT_PAGE_SIZE = 20;

export type RecordAdminAuditInput = {
  actorId: string;
  targetType: AdminAuditTargetType | string;
  targetId: string;
  action: string;
  metadata?: Record<string, unknown>;
};

/** Appends an owner/admin action to the audit log. Requires admin RLS. */
export async function recordAdminAudit(
  supabase: SupabaseClient,
  input: RecordAdminAuditInput,
): Promise<void> {
  const { error } = await supabase.from("admin_audit_log").insert({
    actor_id: input.actorId,
    target_type: input.targetType,
    target_id: input.targetId,
    action: input.action,
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("recordAdminAudit failed", error);
  }
}

export type AdminAuditPageResult = {
  items: AdminAuditLogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
};

/** Paginated audit log for the owner dashboard. */
export async function getAdminAuditLogPage(
  supabase: SupabaseClient,
  page = 1,
): Promise<AdminAuditPageResult> {
  const pageSize = ADMIN_AUDIT_PAGE_SIZE;
  const offset = (Math.max(1, page) - 1) * pageSize;

  const { data, error, count } = await supabase
    .from("admin_audit_log")
    .select("id, actor_id, target_type, target_id, action, metadata, created_at, profiles!admin_audit_log_actor_id_fkey ( full_name )", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("getAdminAuditLogPage failed", error);
    return { items: [], totalCount: 0, page, pageSize };
  }

  const items = (data as unknown as DbAdminAuditLogRow[]).map((row) => ({
    id: row.id,
    actorId: row.actor_id,
    actorName: row.profiles?.full_name ?? null,
    targetType: row.target_type,
    targetId: row.target_id,
    action: row.action,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  }));

  return { items, totalCount: count ?? 0, page, pageSize };
}

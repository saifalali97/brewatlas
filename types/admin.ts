export type AdminAuditTargetType = "user" | "review" | "subscription" | "recipe";

export type AdminAuditLogEntry = {
  id: string;
  actorId: string | null;
  actorName: string | null;
  targetType: AdminAuditTargetType | string;
  targetId: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type DbAdminAuditLogRow = {
  id: string;
  actor_id: string | null;
  target_type: string;
  target_id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  profiles?: { full_name: string | null } | null;
};

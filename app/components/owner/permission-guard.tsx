"use client";

import type { ReactNode } from "react";
import { usePermission } from "@/lib/auth/permissions-context";
import type { Permission } from "@/types/auth";

type PermissionGuardProps = {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
};

/** Hides children unless the signed-in CMS user has the given permission. */
export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const allowed = usePermission(permission);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

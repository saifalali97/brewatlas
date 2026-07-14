"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { roleHasPermission } from "@/lib/auth/permissions";
import type { AppRole, Permission } from "@/types/auth";

type PermissionsContextValue = {
  role: AppRole;
  can: (permission: Permission) => boolean;
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({
  role,
  children,
}: {
  role: AppRole;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      role,
      can: (permission: Permission) => roleHasPermission(role, permission),
    }),
    [role],
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermission(permission: Permission): boolean {
  const context = useContext(PermissionsContext);
  if (!context) return false;
  return context.can(permission);
}

export function usePermissions(): PermissionsContextValue {
  const context = useContext(PermissionsContext);
  if (!context) {
    return {
      role: "user",
      can: () => false,
    };
  }
  return context;
}

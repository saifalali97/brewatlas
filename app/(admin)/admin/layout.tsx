import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/is-admin";
import { AdminDashboardShell } from "@/app/components/admin/admin-dashboard-shell";

/** Root admin route gate and dashboard chrome. */
export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin("/admin");

  return <AdminDashboardShell displayName={session.displayName}>{children}</AdminDashboardShell>;
}

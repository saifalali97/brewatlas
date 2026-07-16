import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { AdminUsersExplorer } from "@/app/components/admin/users/admin-users-explorer";
import { adminCopy } from "@/lib/admin/copy";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getAdminUsersPage } from "@/lib/data/admin-users";
import type { OwnerUserStatusFilter } from "@/lib/data/owner-users";
import type { Metadata } from "next";

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

function parseStatus(value: string | undefined): OwnerUserStatusFilter {
  if (value === "active" || value === "suspended") return value;
  return "all";
}

export async function generateMetadata(): Promise<Metadata> {
  const labels = adminCopy.users;
  return buildAdminMetadata(labels.title, labels.description, "/admin/users");
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { supabase, user } = await requireAdmin("/admin/users");
  const labels = adminCopy.users;

  const filters = {
    search: params.q?.trim() ?? "",
    status: parseStatus(params.status),
  };
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const result = await getAdminUsersPage(supabase, { ...filters, page });

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="users" title={labels.title} description={labels.description} />
      <AdminUsersExplorer result={result} actorId={user.id} filters={filters} />
    </div>
  );
}

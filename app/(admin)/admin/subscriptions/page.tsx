import { AdminPageHeader } from "@/app/components/admin/admin-page-header";
import { OwnerSubscriptionsExplorer } from "@/app/components/owner/subscriptions/owner-subscriptions-explorer";
import { adminCopy } from "@/lib/admin/copy";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { requireAdmin } from "@/lib/auth/is-admin";
import {
  getOwnerSubscriptionsPage,
  type OwnerSubscriptionPlanFilter,
  type OwnerSubscriptionStatusFilter,
} from "@/lib/data/owner-subscriptions";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { MEMBERSHIP_PLANS, SUBSCRIPTION_STATUSES } from "@/types/membership";
import type { Metadata } from "next";

type PageProps = {
  searchParams: Promise<{ q?: string; plan?: string; status?: string; page?: string }>;
};

function parsePlan(value: string | undefined): OwnerSubscriptionPlanFilter {
  if (value && (MEMBERSHIP_PLANS as readonly string[]).includes(value)) return value as OwnerSubscriptionPlanFilter;
  return "all";
}

function parseStatus(value: string | undefined): OwnerSubscriptionStatusFilter {
  if (value && (SUBSCRIPTION_STATUSES as readonly string[]).includes(value)) {
    return value as OwnerSubscriptionStatusFilter;
  }
  return "all";
}

export async function generateMetadata(): Promise<Metadata> {
  const labels = adminCopy.subscriptions;
  return buildAdminMetadata(labels.title, labels.description, "/admin/subscriptions");
}

export default async function AdminSubscriptionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const labels = adminCopy.subscriptions;
  const dictionary = await getDictionary("en");
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const search = params.q?.trim() ?? "";
  const plan = parsePlan(params.plan);
  const status = parseStatus(params.status);

  const { supabase } = await requireAdmin("/admin/subscriptions");
  const result = await getOwnerSubscriptionsPage(supabase, { search, plan, status, page });

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader navId="subscriptions" title={labels.title} description={labels.description} />
      <OwnerSubscriptionsExplorer
        result={result}
        labels={dictionary.ownerSubscriptionsPage}
        filters={{ search, plan, status }}
      />
    </div>
  );
}

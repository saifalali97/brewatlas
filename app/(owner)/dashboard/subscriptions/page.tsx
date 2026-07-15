import type { Metadata } from "next";
import { OwnerSubscriptionsExplorer } from "@/app/components/owner/subscriptions/owner-subscriptions-explorer";
import { PageHeader } from "@/app/components/ui/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { userHasPermission } from "@/lib/auth/permission-middleware";
import {
  getOwnerSubscriptionsPage,
  type OwnerSubscriptionPlanFilter,
  type OwnerSubscriptionStatusFilter,
} from "@/lib/data/owner-subscriptions";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { MEMBERSHIP_PLANS, SUBSCRIPTION_STATUSES } from "@/types/membership";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ q?: string; plan?: string; status?: string; page?: string }>;
};

function parsePlan(value: string | undefined): OwnerSubscriptionPlanFilter {
  if (value && (MEMBERSHIP_PLANS as readonly string[]).includes(value)) return value as OwnerSubscriptionPlanFilter;
  return "all";
}

function parseStatus(value: string | undefined): OwnerSubscriptionStatusFilter {
  if (value && (SUBSCRIPTION_STATUSES as readonly string[]).includes(value)) return value as OwnerSubscriptionStatusFilter;
  return "all";
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard/subscriptions",
    locale,
    title: dictionary.metadata.ownerSubscriptionsTitle,
    description: dictionary.metadata.ownerSubscriptionsDescription,
    noIndex: true,
  });
}

export default async function OwnerSubscriptionsPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.ownerSubscriptionsPage;
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.q?.trim() ?? "";
  const plan = parsePlan(params.plan);
  const status = parseStatus(params.status);

  const { supabase, user } = await requireOwner("/dashboard/subscriptions");
  const allowed = await userHasPermission(supabase, user.id, "cms.subscriptions");
  if (!allowed) {
    redirect("/dashboard");
  }

  const result = await getOwnerSubscriptionsPage(supabase, { search, plan, status, page });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow={labels.eyebrow} title={labels.title} description={labels.description} centered={false} />
      <OwnerSubscriptionsExplorer result={result} labels={labels} filters={{ search, plan, status }} />
    </div>
  );
}

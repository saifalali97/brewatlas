import Link from "next/link";
import {
  Coffee,
  Eye,
  FolderOpen,
  Globe2,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { OwnerActivityFeed } from "@/app/components/owner/activity-feed";
import { OwnerChartPlaceholder } from "@/app/components/owner/chart-placeholder";
import { OwnerStatCard } from "@/app/components/owner/stat-card";
import { adminCopy } from "@/lib/admin/copy";
import { buildAdminMetadata } from "@/lib/admin/metadata";
import { buildAdminNavItems } from "@/lib/admin/nav";
import { requireAdmin } from "@/lib/auth/is-admin";
import { getOwnerAnalyticsOverview } from "@/lib/data/owner-analytics";
import { getOwnerDashboardOverview } from "@/lib/data/owner-dashboard";
import { buttons } from "@/lib/constants/styles";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const labels = adminCopy.dashboard;
  return buildAdminMetadata(labels.title, labels.description, "/admin");
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminDashboardPage() {
  const labels = adminCopy.dashboard;
  const dictionary = await getDictionary("en");
  const { supabase } = await requireAdmin("/admin");
  const [overview, analytics] = await Promise.all([
    getOwnerDashboardOverview(supabase),
    getOwnerAnalyticsOverview(supabase),
  ]);
  const { stats } = overview;
  const { kpis } = analytics;

  const cmsModules = buildAdminNavItems().filter((item) => item.id !== "dashboard");

  return (
    <div className="mx-auto max-w-7xl">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-500/85">{labels.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">{labels.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-400 sm:text-base">{labels.description}</p>
        <Link href="/admin/users" className={`${buttons.secondary} mt-6 inline-flex text-sm`}>
          {labels.viewAllUsers}
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OwnerStatCard label={labels.totalUsers} value={kpis.totalUsers} icon={Users} accent="sky" />
        <OwnerStatCard label={labels.premiumUsers} value={kpis.premiumSubscribers} icon={Wallet} accent="emerald" />
        <OwnerStatCard label={labels.recipes} value={stats.recipes} icon={Coffee} />
        <OwnerStatCard
          label={labels.monthlyRevenue}
          value={formatCurrency(kpis.monthlyRecurringRevenueUsd)}
          hint={labels.monthlyRevenueHint}
          icon={Wallet}
          accent="violet"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OwnerStatCard label={labels.activeUsers30d} value={kpis.activeUsers30d} icon={Users} accent="sky" />
        <OwnerStatCard label={labels.recipeViews} value={kpis.recipeViews} icon={Eye} />
        <OwnerStatCard label={labels.reviews} value={stats.reviews} icon={Star} accent="emerald" />
        <OwnerStatCard label={labels.collections} value={stats.collections} icon={FolderOpen} accent="violet" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OwnerStatCard label={labels.brewers} value={stats.brewers} icon={Users} accent="sky" />
        <OwnerStatCard label={labels.coffeeOrigins} value={stats.coffeeOrigins} icon={Globe2} />
        <OwnerStatCard label={labels.recipeSaves} value={kpis.recipeSaves} icon={FolderOpen} />
        <OwnerStatCard label={labels.flaggedReviews} value={kpis.flaggedReviews} icon={Star} accent="violet" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <OwnerChartPlaceholder
            title={labels.userGrowthChartTitle}
            description={labels.userGrowthChartDescription}
            points={analytics.userGrowth}
          />
          <OwnerChartPlaceholder
            title={labels.recipeGrowthChartTitle}
            description={labels.recipeGrowthChartDescription}
            points={analytics.subscriptionGrowth}
          />
        </div>
        <OwnerChartPlaceholder
          title={labels.revenueChartTitle}
          description={labels.revenueChartDescription}
          points={analytics.revenueTrend}
          valuePrefix="AED "
        />
      </div>

      <div className="mt-8">
        <OwnerActivityFeed
          items={overview.recentActivity}
          labels={dictionary.ownerDashboardPage}
          locale="en"
        />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-stone-100">{labels.cmsSectionsTitle}</h2>
        <p className="mt-2 text-sm text-stone-500">{labels.cmsSectionsDescription}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cmsModules.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-amber-500/25 hover:bg-white/[0.04]"
            >
              <p className="font-medium text-stone-100">{section.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

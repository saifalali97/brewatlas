import type { Metadata } from "next";
import {
  Coffee,
  FolderOpen,
  Globe2,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { OwnerActivityFeed } from "@/app/components/owner/activity-feed";
import { OwnerChartPlaceholder } from "@/app/components/owner/chart-placeholder";
import { OwnerStatCard } from "@/app/components/owner/stat-card";
import { getOwnerDashboardOverview } from "@/lib/data/owner-dashboard";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { requireOwner } from "@/lib/auth/require-owner";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard",
    locale,
    title: dictionary.metadata.ownerDashboardTitle,
    description: dictionary.metadata.ownerDashboardDescription,
    noIndex: true,
  });
}

function formatCurrency(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function OwnerDashboardHomePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.ownerDashboardPage;
  const { supabase } = await requireOwner();
  const overview = await getOwnerDashboardOverview(supabase);
  const { stats } = overview;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-500/85">{labels.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">{labels.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-400 sm:text-base">{labels.description}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OwnerStatCard label={labels.totalUsers} value={stats.totalUsers} icon={Users} accent="sky" />
        <OwnerStatCard label={labels.premiumUsers} value={stats.premiumUsers} icon={Wallet} accent="emerald" />
        <OwnerStatCard label={labels.recipes} value={stats.recipes} icon={Coffee} />
        <OwnerStatCard
          label={labels.monthlyRevenue}
          value={formatCurrency(stats.monthlyRevenueUsd, locale)}
          hint={labels.monthlyRevenueHint}
          icon={Wallet}
          accent="violet"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OwnerStatCard label={labels.brewers} value={stats.brewers} icon={Users} accent="sky" />
        <OwnerStatCard label={labels.coffeeOrigins} value={stats.coffeeOrigins} icon={Globe2} />
        <OwnerStatCard label={labels.reviews} value={stats.reviews} icon={Star} accent="emerald" />
        <OwnerStatCard label={labels.collections} value={stats.collections} icon={FolderOpen} accent="violet" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <OwnerChartPlaceholder
            title={labels.userGrowthChartTitle}
            description={labels.userGrowthChartDescription}
            points={overview.userGrowth}
          />
          <OwnerChartPlaceholder
            title={labels.recipeGrowthChartTitle}
            description={labels.recipeGrowthChartDescription}
            points={overview.recipeGrowth}
          />
        </div>
        <OwnerChartPlaceholder
          title={labels.revenueChartTitle}
          description={labels.revenueChartDescription}
          points={overview.revenueTrend}
          valuePrefix="$"
        />
      </div>

      <div className="mt-8">
        <OwnerActivityFeed items={overview.recentActivity} labels={labels} locale={locale} />
      </div>
    </div>
  );
}

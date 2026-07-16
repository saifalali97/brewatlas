"use client";

import type { ReactNode } from "react";
import type { OwnerAnalyticsOverview, OwnerFunnelStep, OwnerNamedCount, OwnerRecipeMetric } from "@/lib/data/owner-analytics";
import { OwnerChartPlaceholder } from "@/app/components/owner/chart-placeholder";
import { OwnerStatCard } from "@/app/components/owner/stat-card";
import {
  Activity,
  Bookmark,
  Eye,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/types";
import type { AdminAuditPageResult } from "@/lib/data/admin-audit";
import { OwnerAuditLogPanel } from "@/app/components/owner/analytics/owner-audit-log-panel";

type OwnerAnalyticsDashboardProps = {
  overview: OwnerAnalyticsOverview;
  auditLog: AdminAuditPageResult;
  labels: Dictionary["ownerAnalyticsPage"];
  locale: string;
};

function formatCurrency(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function NamedCountList({ items, emptyLabel }: { items: OwnerNamedCount[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-stone-500">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.name}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-stone-300">{item.name}</span>
            <span className="shrink-0 font-medium text-stone-100">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-700/80 to-amber-400/70"
              style={{ width: `${Math.max(8, Math.round((item.count / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function FunnelChart({ steps, labels }: { steps: OwnerFunnelStep[]; labels: Dictionary["ownerAnalyticsPage"] }) {
  const max = Math.max(...steps.map((step) => step.value), 1);
  const labelMap: Record<string, string> = {
    registered: labels.funnelRegistered,
    free: labels.funnelFree,
    trialing: labels.funnelTrialing,
    premium: labels.funnelPremium,
  };

  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div key={step.key}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-stone-400">{labelMap[step.key] ?? step.label}</span>
            <span className="font-medium text-stone-100">{step.value}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-700/70 to-sky-400/60"
              style={{ width: `${Math.max(6, Math.round((step.value / max) * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecipeMetricTable({
  items,
  labels,
  metric,
}: {
  items: OwnerRecipeMetric[];
  labels: Dictionary["ownerAnalyticsPage"];
  metric: "views" | "brews" | "trending";
}) {
  if (items.length === 0) {
    return <p className="text-sm text-stone-500">{labels.noRecipeData}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] text-xs uppercase tracking-[0.12em] text-stone-500">
            <th className="px-3 py-2">{labels.columnRecipe}</th>
            <th className="px-3 py-2">{labels.columnViews}</th>
            <th className="px-3 py-2">{labels.columnSaves}</th>
            <th className="px-3 py-2">{labels.columnBrews}</th>
            <th className="px-3 py-2">{labels.columnRating}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${metric}-${item.recipeId}`} className="border-b border-white/[0.05] text-stone-300">
              <td className="px-3 py-3">
                <Link href={`/recipes/${item.slug}`} className="font-medium text-stone-100 hover:text-amber-300">
                  {item.title}
                </Link>
              </td>
              <td className="px-3 py-3">{item.viewCount}</td>
              <td className="px-3 py-3">{item.saveCount}</td>
              <td className="px-3 py-3">{item.brewCount}</td>
              <td className="px-3 py-3">
                {item.reviewCount > 0 ? `${item.averageRating.toFixed(1)} (${item.reviewCount})` : labels.noRating}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-stone-100">{title}</h3>
      {description ? <p className="mt-1 text-xs text-stone-500">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function OwnerAnalyticsDashboard({ overview, auditLog, labels, locale }: OwnerAnalyticsDashboardProps) {
  const { kpis, revenue } = overview;

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OwnerStatCard label={labels.totalUsers} value={kpis.totalUsers} icon={Users} accent="sky" />
        <OwnerStatCard label={labels.premiumSubscribers} value={kpis.premiumSubscribers} icon={Wallet} accent="emerald" />
        <OwnerStatCard
          label={labels.mrr}
          value={formatCurrency(kpis.monthlyRecurringRevenueUsd, locale)}
          icon={Wallet}
          accent="violet"
        />
        <OwnerStatCard label={labels.activeUsers30d} value={kpis.activeUsers30d} icon={Activity} accent="amber" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OwnerStatCard label={labels.dailyActiveUsers} value={kpis.dailyActiveUsers} icon={Activity} accent="sky" />
        <OwnerStatCard label={labels.weeklyActiveUsers} value={kpis.weeklyActiveUsers} icon={Activity} accent="emerald" />
        <OwnerStatCard label={labels.recipeViews} value={kpis.recipeViews} icon={Eye} />
        <OwnerStatCard label={labels.recipeSaves} value={kpis.recipeSaves} icon={Bookmark} accent="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <OwnerChartPlaceholder
            title={labels.userGrowthChartTitle}
            description={labels.userGrowthChartDescription}
            points={overview.userGrowth}
          />
          <OwnerChartPlaceholder
            title={labels.subscriptionGrowthChartTitle}
            description={labels.subscriptionGrowthChartDescription}
            points={overview.subscriptionGrowth}
          />
        </div>
        <OwnerChartPlaceholder
          title={labels.revenueChartTitle}
          description={labels.revenueChartDescription}
          points={overview.revenueTrend}
          valuePrefix="$"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <MetricPanel title={labels.revenueSectionTitle} description={labels.revenueSectionDescription}>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">{labels.monthlyPlans}</dt>
              <dd className="mt-1 text-2xl font-semibold text-stone-50">{revenue.monthlySubscribers}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">{labels.yearlyPlans}</dt>
              <dd className="mt-1 text-2xl font-semibold text-stone-50">{revenue.yearlySubscribers}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">{labels.churnRate}</dt>
              <dd className="mt-1 text-2xl font-semibold text-stone-50">{formatPercent(revenue.churnRatePercent)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">{labels.trialConversion}</dt>
              <dd className="mt-1 text-2xl font-semibold text-stone-50">{formatPercent(revenue.trialConversionRatePercent)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-stone-500">
            {revenue.stripeConfigured ? labels.stripeConnectedNote : labels.stripeEstimateNote}
          </p>
        </MetricPanel>

        <MetricPanel title={labels.conversionFunnelTitle} description={labels.conversionFunnelDescription}>
          <FunnelChart steps={overview.conversionFunnel} labels={labels} />
        </MetricPanel>

        <MetricPanel title={labels.flaggedReviewsTitle} description={labels.flaggedReviewsDescription}>
          <p className="text-3xl font-semibold text-stone-50">{kpis.flaggedReviews}</p>
          <Link href="/admin/reviews?status=flagged" className="mt-4 inline-flex text-sm font-medium text-amber-400/90 hover:underline">
            {labels.reviewReportsCta}
          </Link>
        </MetricPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <MetricPanel title={labels.topCountriesTitle}>
          <NamedCountList items={overview.topCountries} emptyLabel={labels.noData} />
        </MetricPanel>
        <MetricPanel title={labels.preferredMethodsTitle}>
          <NamedCountList items={overview.preferredBrewMethods} emptyLabel={labels.noData} />
        </MetricPanel>
        <MetricPanel title={labels.preferredDevicesTitle}>
          <NamedCountList items={overview.preferredDevices} emptyLabel={labels.noData} />
        </MetricPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MetricPanel title={labels.mostViewedTitle}>
          <RecipeMetricTable items={overview.mostViewedRecipes} labels={labels} metric="views" />
        </MetricPanel>
        <MetricPanel title={labels.mostBrewedTitle}>
          <RecipeMetricTable items={overview.mostBrewedRecipes} labels={labels} metric="brews" />
        </MetricPanel>
      </div>

      <MetricPanel title={labels.trendingRecipesTitle} description={labels.trendingRecipesDescription}>
        <RecipeMetricTable items={overview.trendingRecipes} labels={labels} metric="trending" />
      </MetricPanel>

      <OwnerAuditLogPanel result={auditLog} labels={labels} />
    </div>
  );
}

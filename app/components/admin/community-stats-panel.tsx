import type { AdminCommunityAnalytics } from "@/types/community-platform";

type CommunityStatsPanelProps = {
  analytics: AdminCommunityAnalytics;
  reports: Array<{ id: string; targetType: string; targetId: string; reason: string; createdAt: string }>;
  title: string;
  description: string;
};

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      <p className="text-2xl font-semibold tabular-nums text-stone-100">{value}</p>
      <p className="mt-1 text-xs text-stone-400">{label}</p>
    </div>
  );
}

export function CommunityStatsPanel({ analytics, reports, title, description }: CommunityStatsPanelProps) {
  return (
    <section className="mt-8 rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold text-stone-100">{title}</h2>
      <p className="mt-1 text-sm text-stone-400">{description}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Daily active users" value={analytics.dailyActiveUsers} />
        <StatTile label="New users" value={analytics.newUsers} />
        <StatTile label="Recipes created" value={analytics.recipesCreated} />
        <StatTile label="Brews logged" value={analytics.brewsLogged} />
        <StatTile label="Comments" value={analytics.comments} />
        <StatTile label="Likes" value={analytics.likes} />
        <StatTile label="New followers" value={analytics.followers} />
        <StatTile label="Open reports" value={analytics.openReports} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500/80">Top recipes</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-300">
            {analytics.topRecipes.length === 0 ? (
              <li className="text-stone-500">No data yet.</li>
            ) : (
              analytics.topRecipes.map((row) => (
                <li key={row.name} className="flex justify-between gap-3">
                  <span>{row.name}</span>
                  <span className="tabular-nums text-stone-500">{row.count}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500/80">Top users</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-300">
            {analytics.topUsers.length === 0 ? (
              <li className="text-stone-500">No data yet.</li>
            ) : (
              analytics.topUsers.map((row) => (
                <li key={row.name} className="flex justify-between gap-3">
                  <span>{row.name}</span>
                  <span className="tabular-nums text-stone-500">{row.count}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500/80">Open moderation reports</h3>
        {reports.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No open reports.</p>
        ) : (
          <ul className="mt-3 divide-y divide-white/[0.06] rounded-xl border border-white/[0.08]">
            {reports.map((report) => (
              <li key={report.id} className="px-4 py-3 text-sm text-stone-300">
                <p>
                  <span className="font-medium text-stone-100">{report.targetType}</span> · {report.reason}
                </p>
                <p className="mt-1 text-xs text-stone-500">{report.targetId}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

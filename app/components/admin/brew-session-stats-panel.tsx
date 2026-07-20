import type { AdminBrewSessionAnalytics } from "@/types/brew-sessions";

type BrewSessionStatsPanelProps = {
  analytics: AdminBrewSessionAnalytics;
  title: string;
  description: string;
};

function StatList({ title, items }: { title: string; items: Array<{ name: string; count: number }> }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500/80">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-stone-300">
        {items.length === 0 ? (
          <li className="text-stone-500">No data yet.</li>
        ) : (
          items.map((row) => (
            <li key={`${title}-${row.name}`} className="flex justify-between gap-3">
              <span>{row.name}</span>
              <span className="tabular-nums text-stone-500">{row.count}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function BrewSessionStatsPanel({ analytics, title, description }: BrewSessionStatsPanelProps) {
  return (
    <section className="mt-8 rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold text-stone-100">{title}</h2>
      <p className="mt-1 text-sm text-stone-400">{description}</p>
      <p className="mt-4 text-sm text-stone-300">
        Total sessions (anonymous aggregate): <span className="font-semibold tabular-nums">{analytics.totalSessions}</span>
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <StatList title="Popular methods" items={analytics.popularMethods} />
        <StatList title="Popular brewers" items={analytics.popularBrewers} />
        <StatList title="Popular grinders" items={analytics.popularGrinders} />
        <StatList title="Popular origins" items={analytics.popularOrigins} />
        <StatList title="Popular official recipes" items={analytics.popularRecipes} />
      </div>
    </section>
  );
}

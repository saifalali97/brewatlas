import type { AdminEquipmentStat } from "@/types/brewing-setup";

type BrewingSetupStatsPanelProps = {
  stats: AdminEquipmentStat[];
  title: string;
  description: string;
};

export function BrewingSetupStatsPanel({ stats, title, description }: BrewingSetupStatsPanelProps) {
  const grinders = stats.filter((row) => row.category === "grinder").slice(0, 5);
  const brewers = stats.filter((row) => row.category === "brewer").slice(0, 5);

  return (
    <section className="mt-8 rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold text-stone-100">{title}</h2>
      <p className="mt-1 text-sm text-stone-400">{description}</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500/80">Top grinders</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-300">
            {grinders.length === 0 ? (
              <li className="text-stone-500">No data yet.</li>
            ) : (
              grinders.map((row) => (
                <li key={`${row.category}-${row.itemName}`} className="flex justify-between gap-3">
                  <span>{row.itemName}</span>
                  <span className="tabular-nums text-stone-500">{row.userCount}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500/80">Top brewers</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-300">
            {brewers.length === 0 ? (
              <li className="text-stone-500">No data yet.</li>
            ) : (
              brewers.map((row) => (
                <li key={`${row.category}-${row.itemName}`} className="flex justify-between gap-3">
                  <span>{row.itemName}</span>
                  <span className="tabular-nums text-stone-500">{row.userCount}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

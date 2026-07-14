import type { OwnerChartPoint } from "@/lib/data/owner-dashboard";

type OwnerChartPlaceholderProps = {
  title: string;
  description: string;
  points: OwnerChartPoint[];
  valuePrefix?: string;
};

export function OwnerChartPlaceholder({
  title,
  description,
  points,
  valuePrefix = "",
}: OwnerChartPlaceholderProps) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-100">{title}</h3>
          <p className="mt-1 text-xs text-stone-500">{description}</p>
        </div>
      </div>

      <div className="mt-8 flex h-44 items-end gap-3" role="img" aria-label={title}>
        {points.map((point) => {
          const height = Math.max(12, Math.round((point.value / max) * 100));
          return (
            <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-36 w-full items-end justify-center">
                <div
                  className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-amber-700/70 via-amber-500/55 to-amber-300/35 shadow-[0_0_24px_rgba(217,119,6,0.18)]"
                  style={{ height: `${height}%` }}
                  title={`${valuePrefix}${point.value}`}
                />
              </div>
              <span className="text-[0.625rem] font-medium uppercase tracking-[0.12em] text-stone-600">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

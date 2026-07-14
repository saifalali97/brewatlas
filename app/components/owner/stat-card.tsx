import type { LucideIcon } from "lucide-react";

type OwnerStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "amber" | "emerald" | "sky" | "violet";
};

const accentStyles = {
  amber: "border-amber-700/25 bg-amber-950/20 text-amber-400",
  emerald: "border-emerald-700/25 bg-emerald-950/20 text-emerald-400",
  sky: "border-sky-700/25 bg-sky-950/20 text-sky-400",
  violet: "border-violet-700/25 bg-violet-950/20 text-violet-400",
};

export function OwnerStatCard({ label, value, hint, icon: Icon, accent = "amber" }: OwnerStatCardProps) {
  return (
    <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-50">{value}</p>
          {hint ? <p className="mt-2 text-xs text-stone-500">{hint}</p> : null}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${accentStyles[accent]}`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </article>
  );
}

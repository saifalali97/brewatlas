import type { LucideIcon } from "lucide-react";
import { meta } from "@/lib/constants/styles";

type MetaTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  compact?: boolean;
  centered?: boolean;
  variant?: "default" | "brewSpec";
};

export function MetaTile({
  icon: Icon,
  label,
  value,
  compact = false,
  centered = false,
  variant = "default",
}: MetaTileProps) {
  if (variant === "brewSpec") {
    return (
      <div className="flex h-full min-h-[5.75rem] flex-col justify-between rounded-xl border border-ba-espresso/[0.08] bg-ac-pearl px-4 py-4 shadow-[0_1px_0_rgba(26,20,16,0.04)] motion-safe:transition-[border-color,box-shadow,transform] motion-safe:duration-200 motion-safe:hover:-translate-y-px motion-safe:hover:border-ba-espresso/[0.12] motion-safe:hover:shadow-[0_10px_32px_-24px_rgba(26,20,16,0.2)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-[6rem] sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ac-espresso/55">{label}</p>
          <span className="inline-flex rounded-lg border border-ba-espresso/[0.06] bg-ba-sand/35 p-1.5">
            <Icon className="h-3.5 w-3.5 shrink-0 text-ba-bronze/90" aria-hidden />
          </span>
        </div>
        <p className="font-display text-xl leading-tight tracking-[-0.02em] text-ba-espresso sm:text-[1.375rem]">
          {value}
        </p>
      </div>
    );
  }

  const baseTile = compact ? meta.tileCompact : meta.tile;
  const tileClass = centered ? baseTile.replace("items-start", "items-center") : baseTile;

  return (
    <div className={tileClass}>
      <Icon className={centered || compact ? meta.iconInline : meta.icon} aria-hidden />
      <div className="min-w-0">
        <p className={meta.label}>{label}</p>
        <p className={meta.value}>{value}</p>
      </div>
    </div>
  );
}

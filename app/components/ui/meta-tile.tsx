import type { LucideIcon } from "lucide-react";
import { meta } from "@/lib/constants/styles";

type MetaTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  compact?: boolean;
  centered?: boolean;
};

export function MetaTile({
  icon: Icon,
  label,
  value,
  compact = false,
  centered = false,
}: MetaTileProps) {
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

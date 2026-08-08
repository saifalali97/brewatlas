import { Building2, Coffee, MapPin } from "lucide-react";

type GulfCountryStatsProps = {
  totalRoasters: number;
  totalRecipes: number;
  citiesCovered: number;
  totalRoastersLabel: string;
  totalRecipesLabel: string;
  citiesCoveredLabel: string;
};

function formatStat(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

/** Compact country stats strip. */
export function GulfCountryStats({
  totalRoasters,
  totalRecipes,
  citiesCovered,
  totalRoastersLabel,
  totalRecipesLabel,
  citiesCoveredLabel,
}: GulfCountryStatsProps) {
  const items = [
    { icon: Building2, value: totalRoasters, label: totalRoastersLabel },
    { icon: Coffee, value: totalRecipes, label: totalRecipesLabel },
    { icon: MapPin, value: citiesCovered, label: citiesCoveredLabel },
  ] as const;

  return (
    <section aria-label="Country statistics" className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-10">
      <div className="grid grid-cols-1 overflow-hidden rounded-[24px] border border-[#C4A574]/22 bg-white shadow-[0_4px_24px_rgba(26,20,16,0.045)] sm:grid-cols-3">
        {items.map(({ icon: Icon, value, label }, index) => (
          <div
            key={label}
            className={`flex items-center gap-4 px-6 py-7 sm:flex-col sm:items-center sm:justify-center sm:gap-3 sm:px-4 sm:py-8 sm:text-center ${
              index > 0 ? "border-t border-[#D4C4A8]/45 sm:border-t-0 sm:border-s" : ""
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F5EFE4]">
              <Icon className="h-5 w-5 text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <p className="font-display text-[1.75rem] font-bold leading-none tracking-[-0.03em] text-[#1A1410]">
                {formatStat(value)}
              </p>
              <p className="mt-1.5 text-[0.8125rem] text-[#1A1410]/55">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import { Coffee, FlaskConical, Heart, ShieldCheck } from "lucide-react";
import type { GulfDirectoryGlobalStats } from "@/lib/data/gulf-directory";

type RecipesVerifiedCuratedProps = {
  title: string;
  description: string;
  verifiedRoasteriesStatLabel: string;
  testedRecipesStatLabel: string;
  brewedWithLoveStatLabel: string;
  stats: GulfDirectoryGlobalStats;
};

function formatStat(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

const statConfig = [
  { icon: ShieldCheck, key: "verifiedRoasteries" as const },
  { icon: FlaskConical, key: "testedRecipes" as const },
  { icon: Heart, key: "brewedWithLove" as const },
];

/** Verified & Curated panel — reference layout with live statistics. */
export function RecipesVerifiedCurated({
  title,
  description,
  verifiedRoasteriesStatLabel,
  testedRecipesStatLabel,
  brewedWithLoveStatLabel,
  stats,
}: RecipesVerifiedCuratedProps) {
  const labels = {
    verifiedRoasteries: verifiedRoasteriesStatLabel,
    testedRecipes: testedRecipesStatLabel,
    brewedWithLove: brewedWithLoveStatLabel,
  };

  return (
    <article
      aria-labelledby="recipes-verified-curated-heading"
      className="relative flex h-full flex-col overflow-hidden rounded-[14px] bg-[#F7F1E8] shadow-[0_2px_18px_rgba(26,20,16,0.06)]"
    >
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-full bg-[#E8DCC8] sm:h-16 sm:w-16">
            <Coffee className="h-7 w-7 text-[#8B6914]" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2
              id="recipes-verified-curated-heading"
              className="font-display text-[1.125rem] leading-tight tracking-[-0.02em] text-[#1A1410] sm:text-[1.1875rem]"
            >
              {title}
            </h2>
            <p className="mt-1.5 text-[0.75rem] leading-[1.55] text-[#1A1410]/62 sm:text-[0.8125rem]">
              {description}
            </p>
          </div>
        </div>

        {/* Decorative botanical — reference corner sketch */}
        <svg
          viewBox="0 0 80 60"
          className="pointer-events-none absolute bottom-[5.5rem] right-4 h-14 w-[4.5rem] opacity-25"
          aria-hidden
        >
          <path
            d="M8 52c12-18 28-28 44-24M20 44c8-10 18-14 28-10M52 20c-6 8-4 16 4 22"
            fill="none"
            stroke="#A67B4A"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      <div className="grid grid-cols-3 border-t border-[#D4C4A8]/45">
        {statConfig.map(({ icon: Icon, key }, index) => (
          <div
            key={key}
            className={`flex flex-col items-center px-3 py-4 text-center sm:px-4 sm:py-5 ${
              index > 0 ? "border-l border-[#D4C4A8]/45" : ""
            }`}
          >
            <Icon className="h-[1.125rem] w-[1.125rem] text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
            <p className="mt-2 font-display text-[1.75rem] leading-none tracking-[-0.03em] text-[#1A1410] sm:text-[2rem]">
              {formatStat(stats[key])}
            </p>
            <p className="mt-1.5 text-[0.6875rem] leading-snug text-[#1A1410]/62 sm:text-xs">
              {labels[key]}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

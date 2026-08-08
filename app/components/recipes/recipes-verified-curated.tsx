import { Coffee, FlaskConical, Heart, ShieldCheck } from "lucide-react";
import type { GulfDirectoryGlobalStats } from "@/lib/data/gulf-directory";
import { rdCard } from "@/lib/design-system/recipes-directory";

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
] as const;

/** Verified & Curated panel — pixel-matched to BrewAtlas reference. */
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
      className={rdCard.verified}
    >
      {/* Header */}
      <div className="relative flex flex-1 items-start gap-5 px-8 pb-8 pt-8">
        <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full bg-[#E8DCC8]">
          <Coffee className="h-9 w-9 text-[#8B6914]" strokeWidth={1.5} aria-hidden />
        </div>

        <div className="min-w-0 pt-2">
          <h2
            id="recipes-verified-curated-heading"
            className="font-display text-[1.5rem] font-bold leading-[1.2] tracking-[-0.03em] text-[#1A1410]"
          >
            {title}
          </h2>
          <p className="mt-2.5 max-w-[32rem] text-[14px] leading-[1.65] text-[#1A1410]/60">
            {description}
          </p>
        </div>

        <svg
          viewBox="0 0 80 60"
          className="pointer-events-none absolute bottom-24 right-6 h-16 w-20 opacity-[0.22]"
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

      {/* Stats */}
      <div className="mt-auto grid grid-cols-3 border-t border-[#D4C4A8]/50">
        {statConfig.map(({ icon: Icon, key }, index) => (
          <div
            key={key}
            className={`flex flex-col items-center justify-center px-4 py-7 text-center ${
              index > 0 ? "border-l border-[#D4C4A8]/50" : ""
            }`}
          >
            <Icon className="h-5 w-5 text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
            <p className="mt-2.5 font-display text-[2rem] leading-none tracking-[-0.03em] text-[#1A1410]">
              {formatStat(stats[key])}
            </p>
            <p className="mt-2 text-[12px] leading-snug text-[#1A1410]/55">{labels[key]}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

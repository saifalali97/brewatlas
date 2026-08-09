import { Coffee, CalendarDays, MapPin, FlaskConical } from "lucide-react";
import { StatsCard } from "@/app/components/recipes/directory";

type GulfRoasterStatsProps = {
  totalRecipes: number;
  foundedYear: number | null;
  locationLabel: string;
  brewingStylesLabel: string;
  totalRecipesLabel: string;
  foundedYearLabel: string;
  locationStatLabel: string;
  brewingStylesStatLabel: string;
  ariaLabel: string;
};

/** Compact stats strip for a Gulf roaster page. */
export function GulfRoasterStats({
  totalRecipes,
  foundedYear,
  locationLabel,
  brewingStylesLabel,
  totalRecipesLabel,
  foundedYearLabel,
  locationStatLabel,
  brewingStylesStatLabel,
  ariaLabel,
}: GulfRoasterStatsProps) {
  return (
    <StatsCard
      ariaLabel={ariaLabel}
      items={[
        { icon: Coffee, value: totalRecipes, label: totalRecipesLabel },
        {
          icon: CalendarDays,
          value: foundedYear != null ? String(foundedYear) : "—",
          label: foundedYearLabel,
        },
        { icon: MapPin, value: locationLabel, label: locationStatLabel },
        { icon: FlaskConical, value: brewingStylesLabel, label: brewingStylesStatLabel },
      ]}
    />
  );
}

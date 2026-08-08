import { Building2, Coffee, MapPin } from "lucide-react";
import { StatsCard } from "@/app/components/recipes/directory";

type GulfCountryStatsProps = {
  totalRoasters: number;
  totalRecipes: number;
  citiesCovered: number;
  totalRoastersLabel: string;
  totalRecipesLabel: string;
  citiesCoveredLabel: string;
};

/** Compact country stats strip. */
export function GulfCountryStats({
  totalRoasters,
  totalRecipes,
  citiesCovered,
  totalRoastersLabel,
  totalRecipesLabel,
  citiesCoveredLabel,
}: GulfCountryStatsProps) {
  return (
    <StatsCard
      ariaLabel="Country statistics"
      items={[
        { icon: Building2, value: totalRoasters, label: totalRoastersLabel },
        { icon: Coffee, value: totalRecipes, label: totalRecipesLabel },
        { icon: MapPin, value: citiesCovered, label: citiesCoveredLabel },
      ]}
    />
  );
}

import {
  EmptyState,
  RoasterCard,
  SectionDescription,
  SectionTitle,
} from "@/app/components/recipes/directory";
import { rdLayout } from "@/lib/design-system/recipes-directory";
import {
  gulfRoasterPath,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import type { GulfCountryPageRoaster } from "@/lib/gulf-directory/country-page-types";

type GulfRoasterRelatedProps = {
  countrySlug: GulfDirectoryCountrySlug;
  title: string;
  description: string;
  roasters: GulfCountryPageRoaster[];
  specialtyLabel: string;
  exploreLabel: string;
  recipeCountTemplate: (count: number) => string;
  emptyLabel: string;
};

/** Related roasters from the same country. */
export function GulfRoasterRelated({
  countrySlug,
  title,
  description,
  roasters,
  specialtyLabel,
  exploreLabel,
  recipeCountTemplate,
  emptyLabel,
}: GulfRoasterRelatedProps) {
  return (
    <section
      aria-labelledby="gulf-roaster-related-heading"
      className={rdLayout.container}
    >
      <div className="max-w-2xl">
        <SectionTitle id="gulf-roaster-related-heading">{title}</SectionTitle>
        {description ? <SectionDescription>{description}</SectionDescription> : null}
      </div>

      {roasters.length === 0 ? (
        <EmptyState>{emptyLabel}</EmptyState>
      ) : (
        <div className={`${rdLayout.gridGap} ${rdLayout.cardGrid}`}>
          {roasters.map((roaster) => (
            <RoasterCard
              key={roaster.id}
              href={gulfRoasterPath(countrySlug, roaster.slug)}
              name={roaster.name}
              city={roaster.city}
              specialty={roaster.specialty}
              recipeCountLabel={recipeCountTemplate(roaster.recipeCount)}
              specialtyLabel={specialtyLabel}
              exploreLabel={exploreLabel}
              logoUrl={roaster.logoUrl}
            />
          ))}
        </div>
      )}
    </section>
  );
}

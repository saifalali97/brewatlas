"use client";

import { useMemo, useState } from "react";
import {
  EmptyState,
  FilterBar,
  SectionTitle,
  type FilterBarField,
} from "@/app/components/recipes/directory";
import { GulfCountryRoasterCard } from "@/app/components/recipes/gulf-country-roaster-card";
import { rdLayout } from "@/lib/design-system/recipes-directory";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import type { GulfCountryPageRoaster } from "@/lib/gulf-directory/country-page-types";
import { interpolate } from "@/lib/i18n/format";
import type { Difficulty } from "@/types/homepage";

type GulfCountryExplorerProps = {
  countrySlug: GulfDirectoryCountrySlug;
  roasters: GulfCountryPageRoaster[];
  cities: string[];
  brewMethods: string[];
  difficulties: Difficulty[];
  labels: {
    sectionTitle: string;
    filtersAriaLabel: string;
    filterCity: string;
    filterBrewMethod: string;
    filterRoaster: string;
    filterDifficulty: string;
    filterAny: string;
    specialtyLabel: string;
    exploreLabel: string;
    recipeCountTemplate: string;
    noMatchingRoasters: string;
    noRoastersInCountry: string;
    difficultyLabels: Record<Difficulty, string>;
    brewMethodLabels: Record<string, string>;
  };
};

/** Client filters + roaster grid for a Gulf country page. */
export function GulfCountryExplorer({
  countrySlug,
  roasters,
  cities,
  brewMethods,
  difficulties,
  labels,
}: GulfCountryExplorerProps) {
  const [city, setCity] = useState("");
  const [brewMethod, setBrewMethod] = useState("");
  const [roasterId, setRoasterId] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const filtered = useMemo(() => {
    return roasters.filter((roaster) => {
      if (city && roaster.city !== city) return false;
      if (roasterId && roaster.id !== roasterId) return false;
      if (brewMethod && !roaster.brewMethods.includes(brewMethod)) return false;
      if (difficulty && !roaster.difficulties.includes(difficulty as Difficulty)) return false;
      return true;
    });
  }, [roasters, city, brewMethod, roasterId, difficulty]);

  const fields: FilterBarField[] = [
    {
      id: "city",
      label: labels.filterCity,
      value: city,
      onChange: setCity,
      anyLabel: labels.filterAny,
      options: cities.map((value) => ({ value, label: value })),
    },
    {
      id: "brewMethod",
      label: labels.filterBrewMethod,
      value: brewMethod,
      onChange: setBrewMethod,
      anyLabel: labels.filterAny,
      options: brewMethods.map((value) => ({
        value,
        label: labels.brewMethodLabels[value] ?? value,
      })),
    },
    {
      id: "roaster",
      label: labels.filterRoaster,
      value: roasterId,
      onChange: setRoasterId,
      anyLabel: labels.filterAny,
      options: roasters.map((roaster) => ({ value: roaster.id, label: roaster.name })),
    },
    {
      id: "difficulty",
      label: labels.filterDifficulty,
      value: difficulty,
      onChange: setDifficulty,
      anyLabel: labels.filterAny,
      options: difficulties.map((value) => ({
        value,
        label: labels.difficultyLabels[value],
      })),
    },
  ];

  return (
    <section
      aria-labelledby="gulf-country-roasters-heading"
      className={rdLayout.container}
    >
      <SectionTitle id="gulf-country-roasters-heading">{labels.sectionTitle}</SectionTitle>

      <FilterBar ariaLabel={labels.filtersAriaLabel} fields={fields} />

      {roasters.length === 0 ? (
        <EmptyState>{labels.noRoastersInCountry}</EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState>{labels.noMatchingRoasters}</EmptyState>
      ) : (
        <div className={`${rdLayout.gridGap} ${rdLayout.cardGrid}`}>
          {filtered.map((roaster) => (
            <GulfCountryRoasterCard
              key={roaster.id}
              countrySlug={countrySlug}
              roaster={roaster}
              recipeCountLabel={interpolate(labels.recipeCountTemplate, {
                count: String(roaster.recipeCount),
              })}
              specialtyLabel={labels.specialtyLabel}
              exploreLabel={labels.exploreLabel}
            />
          ))}
        </div>
      )}
    </section>
  );
}

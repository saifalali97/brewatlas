"use client";

import { useMemo, useState } from "react";
import { GulfCountryRoasterCard } from "@/app/components/recipes/gulf-country-roaster-card";
import { forms } from "@/lib/constants/styles";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import type { GulfCountryPageRoaster } from "@/lib/gulf-directory/country-page-data";
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

const selectClass = `${forms.select} mt-1.5`;

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

  return (
    <section
      aria-labelledby="gulf-country-roasters-heading"
      className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-10"
    >
      <h2
        id="gulf-country-roasters-heading"
        className="font-display text-[1.75rem] font-bold tracking-[-0.03em] text-[#1A1410] sm:text-[2rem]"
      >
        {labels.sectionTitle}
      </h2>

      <div
        role="search"
        aria-label={labels.filtersAriaLabel}
        className="mt-6 grid grid-cols-1 gap-3 rounded-[20px] border border-[#C4A574]/20 bg-white/80 p-4 shadow-[0_4px_20px_rgba(26,20,16,0.03)] sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="block text-[0.75rem] font-medium uppercase tracking-[0.06em] text-[#1A1410]/45">
          {labels.filterCity}
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className={selectClass}
          >
            <option value="">{labels.filterAny}</option>
            {cities.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[0.75rem] font-medium uppercase tracking-[0.06em] text-[#1A1410]/45">
          {labels.filterBrewMethod}
          <select
            value={brewMethod}
            onChange={(event) => setBrewMethod(event.target.value)}
            className={selectClass}
          >
            <option value="">{labels.filterAny}</option>
            {brewMethods.map((value) => (
              <option key={value} value={value}>
                {labels.brewMethodLabels[value] ?? value}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[0.75rem] font-medium uppercase tracking-[0.06em] text-[#1A1410]/45">
          {labels.filterRoaster}
          <select
            value={roasterId}
            onChange={(event) => setRoasterId(event.target.value)}
            className={selectClass}
          >
            <option value="">{labels.filterAny}</option>
            {roasters.map((roaster) => (
              <option key={roaster.id} value={roaster.id}>
                {roaster.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[0.75rem] font-medium uppercase tracking-[0.06em] text-[#1A1410]/45">
          {labels.filterDifficulty}
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className={selectClass}
          >
            <option value="">{labels.filterAny}</option>
            {difficulties.map((value) => (
              <option key={value} value={value}>
                {labels.difficultyLabels[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {roasters.length === 0 ? (
        <p className="mt-10 text-[0.9375rem] leading-relaxed text-[#1A1410]/60">
          {labels.noRoastersInCountry}
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-[0.9375rem] leading-relaxed text-[#1A1410]/60">
          {labels.noMatchingRoasters}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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

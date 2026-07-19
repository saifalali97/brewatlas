"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { buttons, forms } from "@/lib/constants/styles";
import { difficultyLabelKey } from "@/lib/i18n/home-labels";
import { useTranslations } from "@/lib/i18n/translation-context";
import { countActiveFilters } from "@/lib/search/params";
import type { Difficulty } from "@/types/homepage";
import type { SearchFilterOptions, SearchFilters } from "@/types/search";

type SearchFiltersPanelProps = {
  filters: SearchFilters;
  options: SearchFilterOptions;
  onChange: (next: SearchFilters) => void;
  onClear: () => void;
  variant: "sidebar" | "sheet";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={forms.label}>{label}</label>
      {children}
    </div>
  );
}

function FiltersForm({
  filters,
  options,
  onChange,
  onClear,
  onDone,
}: {
  filters: SearchFilters;
  options: SearchFilterOptions;
  onChange: (next: SearchFilters) => void;
  onClear: () => void;
  onDone?: () => void;
}) {
  const { t } = useTranslations();
  const activeCount = countActiveFilters(filters);

  const patch = (partial: Partial<SearchFilters>) => {
    onChange({ ...filters, ...partial, page: 1 });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ba-espresso">{t("searchPage.filtersTitle")}</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-ac-espresso transition-colors hover:text-ba-bronze"
          >
            {t("searchPage.clearFilters")}
          </button>
        )}
      </div>

      <FilterField label={t("searchPage.filterCountry")}>
        <select
          value={filters.country}
          onChange={(event) => patch({ country: event.target.value })}
          className={forms.select}
        >
          <option value="">{t("searchPage.filterAny")}</option>
          {options.countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label={t("searchPage.filterRegion")}>
        <select
          value={filters.region}
          onChange={(event) => patch({ region: event.target.value })}
          className={forms.select}
        >
          <option value="">{t("searchPage.filterAny")}</option>
          {options.regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label={t("searchPage.filterOrigin")}>
        <select
          value={filters.originId}
          onChange={(event) => patch({ originId: event.target.value })}
          className={forms.select}
        >
          <option value="">{t("searchPage.filterAny")}</option>
          {options.originOptions.map((origin) => (
            <option key={origin.id} value={origin.id}>
              {origin.label}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label={t("searchPage.filterRoaster")}>
        <select
          value={filters.roasterId}
          onChange={(event) => patch({ roasterId: event.target.value })}
          className={forms.select}
        >
          <option value="">{t("searchPage.filterAny")}</option>
          {options.roasters.map((roaster) => (
            <option key={roaster.id} value={roaster.id}>
              {roaster.name}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label={t("searchPage.filterRoast")}>
        <select
          value={filters.roastLevel}
          onChange={(event) => patch({ roastLevel: event.target.value })}
          className={forms.select}
        >
          <option value="">{t("searchPage.filterAny")}</option>
          {options.roastLevels.map((roast) => (
            <option key={roast} value={roast}>
              {roast}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label={t("searchPage.filterProcess")}>
        <select
          value={filters.process}
          onChange={(event) => patch({ process: event.target.value })}
          className={forms.select}
        >
          <option value="">{t("searchPage.filterAny")}</option>
          {options.processes.map((process) => (
            <option key={process} value={process}>
              {process}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label={t("searchPage.filterMethod")}>
        <select
          value={filters.brewingMethodId}
          onChange={(event) => patch({ brewingMethodId: event.target.value })}
          className={forms.select}
        >
          <option value="">{t("searchPage.filterAny")}</option>
          {options.brewingMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label={t("searchPage.filterDevice")}>
        <select
          value={filters.deviceId}
          onChange={(event) => patch({ deviceId: event.target.value })}
          className={forms.select}
        >
          <option value="">{t("searchPage.filterAny")}</option>
          {options.devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label={t("searchPage.filterGrinder")}>
        <select
          value={filters.grinderId}
          onChange={(event) => patch({ grinderId: event.target.value })}
          className={forms.select}
        >
          <option value="">{t("searchPage.filterAny")}</option>
          {options.grinders.map((grinder) => (
            <option key={grinder.id} value={grinder.id}>
              {grinder.name}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label={t("searchPage.filterDifficulty")}>
        <select
          value={filters.difficulty}
          onChange={(event) => patch({ difficulty: event.target.value })}
          className={forms.select}
        >
          <option value="">{t("searchPage.filterAny")}</option>
          {options.difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {t(difficultyLabelKey(difficulty as Difficulty))}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label={t("searchPage.filterBrewTime")}>
        <input
          type="number"
          min={1}
          value={filters.brewTimeMax}
          onChange={(event) => patch({ brewTimeMax: event.target.value })}
          placeholder={t("searchPage.filterBrewTimePlaceholder")}
          className={forms.input}
        />
      </FilterField>

      <FilterField label={t("searchPage.filterTastingNotes")}>
        <input
          type="search"
          value={filters.tastingNotes}
          onChange={(event) => patch({ tastingNotes: event.target.value })}
          placeholder={t("searchPage.filterTastingNotesPlaceholder")}
          className={forms.input}
        />
      </FilterField>

      <FilterField label={t("searchPage.filterTag")}>
        <select
          value={filters.tagId}
          onChange={(event) => patch({ tagId: event.target.value })}
          className={forms.select}
        >
          <option value="">{t("searchPage.filterAny")}</option>
          {options.tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </FilterField>

      <div className="grid grid-cols-2 gap-3">
        <FilterField label={t("searchPage.filterDoseMin")}>
          <input
            type="number"
            min={0}
            step={0.1}
            value={filters.doseMin}
            onChange={(event) => patch({ doseMin: event.target.value })}
            className={forms.input}
          />
        </FilterField>
        <FilterField label={t("searchPage.filterDoseMax")}>
          <input
            type="number"
            min={0}
            step={0.1}
            value={filters.doseMax}
            onChange={(event) => patch({ doseMax: event.target.value })}
            className={forms.input}
          />
        </FilterField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FilterField label={t("searchPage.filterWaterMin")}>
          <input
            type="number"
            min={0}
            value={filters.waterMin}
            onChange={(event) => patch({ waterMin: event.target.value })}
            className={forms.input}
          />
        </FilterField>
        <FilterField label={t("searchPage.filterWaterMax")}>
          <input
            type="number"
            min={0}
            value={filters.waterMax}
            onChange={(event) => patch({ waterMax: event.target.value })}
            className={forms.input}
          />
        </FilterField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FilterField label={t("searchPage.filterTempMin")}>
          <input
            type="number"
            min={0}
            value={filters.tempMin}
            onChange={(event) => patch({ tempMin: event.target.value })}
            className={forms.input}
          />
        </FilterField>
        <FilterField label={t("searchPage.filterTempMax")}>
          <input
            type="number"
            min={0}
            value={filters.tempMax}
            onChange={(event) => patch({ tempMax: event.target.value })}
            className={forms.input}
          />
        </FilterField>
      </div>

      <label className={forms.checkboxRow}>
        <input
          type="checkbox"
          checked={filters.premiumOnly}
          onChange={(event) => patch({ premiumOnly: event.target.checked })}
          className={forms.checkbox}
        />
        {t("searchPage.filterPremium")}
      </label>

      <label className={forms.checkboxRow}>
        <input
          type="checkbox"
          checked={filters.featuredOnly}
          onChange={(event) => patch({ featuredOnly: event.target.checked })}
          className={forms.checkbox}
        />
        {t("searchPage.filterFeatured")}
      </label>

      {onDone && (
        <button type="button" onClick={onDone} className={`${buttons.primary} w-full`}>
          {t("searchPage.applyFilters")}
        </button>
      )}
    </div>
  );
}

export function SearchFiltersPanel({
  filters,
  options,
  onChange,
  onClear,
  variant,
  open = false,
  onOpenChange,
}: SearchFiltersPanelProps) {
  const { t } = useTranslations();
  const activeCount = countActiveFilters(filters);

  if (variant === "sidebar") {
    return (
      <aside className="hidden lg:block">
        <div className="sticky top-28 rounded-[1.25rem] border border-ba-espresso/10 bg-ba-pearl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <FiltersForm filters={filters} options={options} onChange={onChange} onClear={onClear} />
        </div>
      </aside>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange?.(true)}
        className={`${buttons.secondary} relative flex min-h-11 w-full items-center justify-center gap-2 lg:hidden`}
        aria-expanded={open}
        aria-controls="search-filters-sheet"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        {t("searchPage.filtersTitle")}
        {activeCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ba-gold px-1.5 text-[10px] font-semibold text-ba-espresso">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#0a0705]/80 backdrop-blur-sm"
            aria-label={t("searchPage.closeFilters")}
            onClick={() => onOpenChange?.(false)}
          />
          <div
            id="search-filters-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={t("searchPage.filtersTitle")}
            className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[1.5rem] border border-ba-espresso/[0.12] bg-[#0f0b08] p-5 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-[0_-24px_64px_rgba(0,0,0,0.55)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ba-espresso">{t("searchPage.filtersTitle")}</h2>
              <button
                type="button"
                onClick={() => onOpenChange?.(false)}
                className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-ba-espresso/[0.12] text-ac-espresso transition-colors hover:text-ba-espresso"
                aria-label={t("searchPage.closeFilters")}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <FiltersForm
              filters={filters}
              options={options}
              onChange={onChange}
              onClear={onClear}
              onDone={() => onOpenChange?.(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

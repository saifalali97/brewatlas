"use client";

import { useMemo, useState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { DictionaryKey } from "@/lib/i18n/types";
import {
  deleteEquipmentItemAction,
  importBrewingSetupAction,
  saveBrewingProfileAction,
  saveEquipmentItemAction,
  type BrewingSetupActionState,
} from "@/lib/supabase/brewing-setup-actions";
import type { BrewingSetupExport, UserBrewingSetup, UserEquipmentCategory } from "@/types/brewing-setup";
import type { LookupOption } from "@/types/recipe";
import { useActionState } from "react";

type OriginOption = { id: string; label: string };

type BrewingSetupExplorerProps = {
  setup: UserBrewingSetup;
  grinders: LookupOption[];
  devices: LookupOption[];
  xbloomDevices: LookupOption[];
  filterTypes: LookupOption[];
  waterProfiles: LookupOption[];
  brewingMethods: LookupOption[];
  origins: OriginOption[];
  roastLevels: string[];
  processes: string[];
};

const SECTIONS = ["brewers", "grinders", "equipment", "water", "preferences", "defaults", "import"] as const;
type SectionId = (typeof SECTIONS)[number];

const CATEGORY_BY_SECTION: Partial<Record<SectionId, UserEquipmentCategory[]>> = {
  brewers: ["brewer", "xbloom", "espresso_machine"],
  grinders: ["grinder"],
  equipment: ["kettle", "scale", "filter", "other"],
};

export function BrewingSetupExplorer({
  setup,
  grinders,
  devices,
  xbloomDevices,
  filterTypes,
  waterProfiles,
  brewingMethods,
  origins,
  roastLevels,
  processes,
}: BrewingSetupExplorerProps) {
  const { t } = useTranslations();
  const l = (key: string) => t(`brewingSetupPage.${key}` as DictionaryKey);
  const [activeSection, setActiveSection] = useState<SectionId>("brewers");
  const [profileState, profileAction, profilePending] = useActionState<BrewingSetupActionState, FormData>(
    saveBrewingProfileAction,
    undefined,
  );
  const [equipmentState, equipmentAction, equipmentPending] = useActionState<BrewingSetupActionState, FormData>(
    saveEquipmentItemAction,
    undefined,
  );
  const [importState, importAction, importPending] = useActionState<BrewingSetupActionState, FormData>(
    importBrewingSetupAction,
    undefined,
  );
  const [, deleteAction] = useActionState<BrewingSetupActionState, FormData>(deleteEquipmentItemAction, undefined);

  const profile = setup.profile;
  const equipmentByCategory = useMemo(() => {
    const map = new Map<UserEquipmentCategory, typeof setup.equipment>();
    for (const item of setup.equipment) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [setup]);

  const exportJson = useMemo(() => {
    if (!profile) return "";
    const payload: BrewingSetupExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: {
        experienceLevel: profile.experienceLevel,
        setupContext: profile.setupContext,
        favoriteRoastLevel: profile.favoriteRoastLevel,
        favoriteProcessing: profile.favoriteProcessing,
        favoriteBrewRatio: profile.favoriteBrewRatio,
        favoriteTemperatureC: profile.favoriteTemperatureC,
        preferredUnits: profile.preferredUnits,
        preferredWaterProfileId: profile.preferredWaterProfileId,
        preferredWaterProfileName: profile.preferredWaterProfileName,
        favoriteBrewingMethodId: profile.favoriteBrewingMethodId,
        favoriteBrewingMethodName: profile.favoriteBrewingMethodName,
        defaultBrewerItemId: profile.defaultBrewerItemId,
        defaultGrinderItemId: profile.defaultGrinderItemId,
        defaultKettleItemId: profile.defaultKettleItemId,
        defaultScaleItemId: profile.defaultScaleItemId,
        defaultFilterItemId: profile.defaultFilterItemId,
        favoriteOriginIds: profile.favoriteOriginIds,
        favoriteRecipeIds: profile.favoriteRecipeIds,
        notes: profile.notes,
      },
      equipment: setup.equipment.map((item) => ({
        category: item.category,
        deviceId: item.deviceId,
        grinderId: item.grinderId,
        filterTypeId: item.filterTypeId,
        xbloomDeviceId: item.xbloomDeviceId,
        customLabel: item.customLabel,
        notes: item.notes,
        isDefault: item.isDefault,
        isFavorite: item.isFavorite,
        isRetired: item.isRetired,
        sortOrder: item.sortOrder,
      })),
    };
    return JSON.stringify(payload, null, 2);
  }, [profile, setup.equipment]);

  function renderEquipmentList(categories: UserEquipmentCategory[]) {
    const items = categories.flatMap((category) => equipmentByCategory.get(category) ?? []);
    if (items.length === 0) {
      return <p className="text-sm text-ac-espresso">{l("noEquipmentYet")}</p>;
    }
    return (
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ba-espresso/10 bg-white/40 px-4 py-3"
          >
            <div>
              <p className="font-medium text-ac-espresso">{item.displayName}</p>
              <p className="text-xs text-ac-espresso/70 capitalize">
                {item.category.replace("_", " ")}
                {item.isDefault ? ` · ${l("defaultBadge")}` : ""}
                {item.isFavorite ? ` · ${l("favoriteBadge")}` : ""}
                {item.isRetired ? ` · ${l("retiredBadge")}` : ""}
              </p>
            </div>
            <form action={deleteAction}>
              <input type="hidden" name="itemId" value={item.id} />
              <button type="submit" className="text-xs text-red-700 underline-offset-2 hover:underline">
                {l("removeCta")}
              </button>
            </form>
          </li>
        ))}
      </ul>
    );
  }

  function renderAddEquipmentForm(categories: UserEquipmentCategory[]) {
    const category = categories[0];
    return (
      <form action={equipmentAction} className="mt-6 grid gap-4 rounded-xl border border-ba-espresso/10 bg-white/30 p-4">
        <input type="hidden" name="category" value={category} />
        {category === "brewer" ? (
          <label className={forms.label}>
            {l("brewerLabel")}
            <select name="deviceId" className={forms.select}>
              <option value="">{l("selectPlaceholder")}</option>
              {devices.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {category === "grinder" ? (
          <label className={forms.label}>
            {l("grinderLabel")}
            <select name="grinderId" className={forms.select}>
              <option value="">{l("selectPlaceholder")}</option>
              {grinders.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {category === "xbloom" ? (
          <label className={forms.label}>
            {l("xbloomLabel")}
            <select name="xbloomDeviceId" className={forms.select}>
              <option value="">{l("selectPlaceholder")}</option>
              {xbloomDevices.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {category === "filter" ? (
          <label className={forms.label}>
            {l("filterLabel")}
            <select name="filterTypeId" className={forms.select}>
              <option value="">{l("selectPlaceholder")}</option>
              {filterTypes.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {category === "kettle" || category === "scale" || category === "espresso_machine" || category === "other" ? (
          <label className={forms.label}>
            {l("customLabel")}
            <input name="customLabel" className={forms.input} placeholder={l("customPlaceholder")} />
          </label>
        ) : null}
        <label className={forms.checkboxRow}>
          <input type="checkbox" name="isDefault" value="1" className={forms.checkbox} defaultChecked />
          {l("markDefault")}
        </label>
        <label className={forms.checkboxRow}>
          <input type="checkbox" name="isFavorite" value="1" className={forms.checkbox} />
          {l("markFavorite")}
        </label>
        <button type="submit" className={buttons.primary} disabled={equipmentPending}>
          {equipmentPending ? l("savingCta") : l("addEquipmentCta")}
        </button>
        <FormMessage error={equipmentState?.error} success={equipmentState?.success} />
      </form>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav className="flex flex-wrap gap-2 lg:flex-col">
        {SECTIONS.map((section) => (
          <button
            key={section}
            type="button"
            onClick={() => setActiveSection(section)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              activeSection === section
                ? "bg-ba-espresso text-ba-pearl"
                : "border border-ba-espresso/15 text-ac-espresso hover:bg-ba-espresso/5"
            }`}
          >
            {l(`section_${section}`)}
          </button>
        ))}
      </nav>

      <div className="rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] sm:p-8">
        {(activeSection === "brewers" || activeSection === "grinders" || activeSection === "equipment") && (
          <div>
            <h2 className="text-lg font-semibold text-ac-espresso">{l(`section_${activeSection}`)}</h2>
            <p className="mt-1 text-sm text-ac-espresso">{l(`section_${activeSection}_description`)}</p>
            <div className="mt-6">{renderEquipmentList(CATEGORY_BY_SECTION[activeSection] ?? [])}</div>
            {(CATEGORY_BY_SECTION[activeSection] ?? []).map((category) => (
              <div key={category} className="mt-8">
                <h3 className="text-sm font-semibold capitalize text-ac-espresso">{category.replace("_", " ")}</h3>
                {renderAddEquipmentForm([category])}
              </div>
            ))}
          </div>
        )}

        {(activeSection === "water" || activeSection === "preferences" || activeSection === "defaults") && (
          <form action={profileAction} className="space-y-5">
            <h2 className="text-lg font-semibold text-ac-espresso">{l(`section_${activeSection}`)}</h2>
            <p className="text-sm text-ac-espresso">{l(`section_${activeSection}_description`)}</p>

            {activeSection === "water" ? (
              <label className={forms.label}>
                {l("waterProfileLabel")}
                <select name="preferredWaterProfileId" defaultValue={profile?.preferredWaterProfileId ?? ""} className={forms.select}>
                  <option value="">{l("selectPlaceholder")}</option>
                  {waterProfiles.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {activeSection === "preferences" ? (
              <>
                <label className={forms.label}>
                  {l("experienceLabel")}
                  <select name="experienceLevel" defaultValue={profile?.experienceLevel ?? ""} className={forms.select}>
                    <option value="">{l("selectPlaceholder")}</option>
                    <option value="beginner">{l("experience_beginner")}</option>
                    <option value="intermediate">{l("experience_intermediate")}</option>
                    <option value="advanced">{l("experience_advanced")}</option>
                    <option value="professional">{l("experience_professional")}</option>
                  </select>
                </label>
                <label className={forms.label}>
                  {l("setupContextLabel")}
                  <select name="setupContext" defaultValue={profile?.setupContext ?? "home"} className={forms.select}>
                    <option value="home">{l("context_home")}</option>
                    <option value="cafe">{l("context_cafe")}</option>
                    <option value="both">{l("context_both")}</option>
                  </select>
                </label>
                <label className={forms.label}>
                  {l("roastLabel")}
                  <select name="favoriteRoastLevel" defaultValue={profile?.favoriteRoastLevel ?? ""} className={forms.select}>
                    <option value="">{l("selectPlaceholder")}</option>
                    {roastLevels.map((roast) => (
                      <option key={roast} value={roast}>
                        {roast}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={forms.label}>
                  {l("processingLabel")}
                  <select name="favoriteProcessing" defaultValue={profile?.favoriteProcessing ?? ""} className={forms.select}>
                    <option value="">{l("selectPlaceholder")}</option>
                    {processes.map((process) => (
                      <option key={process} value={process}>
                        {process}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={forms.label}>
                  {l("ratioLabel")}
                  <input name="favoriteBrewRatio" defaultValue={profile?.favoriteBrewRatio ?? ""} className={forms.input} placeholder="1:16" />
                </label>
                <label className={forms.label}>
                  {l("temperatureLabel")}
                  <input
                    name="favoriteTemperatureC"
                    type="number"
                    defaultValue={profile?.favoriteTemperatureC ?? ""}
                    className={forms.input}
                    placeholder="93"
                  />
                </label>
                <label className={forms.label}>
                  {l("brewMethodLabel")}
                  <select name="favoriteBrewingMethodId" defaultValue={profile?.favoriteBrewingMethodId ?? ""} className={forms.select}>
                    <option value="">{l("selectPlaceholder")}</option>
                    {brewingMethods.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
                <fieldset>
                  <legend className={forms.label}>{l("originsLabel")}</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {origins.slice(0, 24).map((origin) => (
                      <label key={origin.id} className={forms.checkboxRow}>
                        <input
                          type="checkbox"
                          name="originIds"
                          value={origin.id}
                          defaultChecked={profile?.favoriteOriginIds.includes(origin.id)}
                          className={forms.checkbox}
                        />
                        {origin.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            ) : null}

            {activeSection === "defaults" ? (
              <>
                {(
                  [
                    ["defaultBrewerItemId", "brewer", setup.equipment.filter((i) => i.category === "brewer" && !i.isRetired)],
                    ["defaultGrinderItemId", "grinder", setup.equipment.filter((i) => i.category === "grinder" && !i.isRetired)],
                    ["defaultKettleItemId", "kettle", setup.equipment.filter((i) => i.category === "kettle" && !i.isRetired)],
                    ["defaultScaleItemId", "scale", setup.equipment.filter((i) => i.category === "scale" && !i.isRetired)],
                    ["defaultFilterItemId", "filter", setup.equipment.filter((i) => i.category === "filter" && !i.isRetired)],
                  ] as const
                ).map(([field, labelKey, items]) => (
                  <label key={field} className={forms.label}>
                    {l(`${labelKey}Label`)}
                    <select name={field} defaultValue={(profile as Record<string, string | null> | null)?.[field] ?? ""} className={forms.select}>
                      <option value="">{l("selectPlaceholder")}</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.displayName}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </>
            ) : null}

            <button type="submit" className={buttons.primary} disabled={profilePending}>
              {profilePending ? l("savingCta") : l("saveProfileCta")}
            </button>
            <FormMessage error={profileState?.error} success={profileState?.success} />
          </form>
        )}

        {activeSection === "import" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-ac-espresso">{l("section_import")}</h2>
            <p className="text-sm text-ac-espresso">{l("section_import_description")}</p>
            <label className={forms.label}>
              {l("exportLabel")}
              <textarea readOnly value={exportJson} rows={8} className={`${forms.input} font-mono text-xs`} />
            </label>
            <form action={importAction} className="space-y-4">
              <label className={forms.label}>
                {l("importLabel")}
                <textarea name="importJson" rows={8} className={`${forms.input} font-mono text-xs`} placeholder='{"version": 1}' />
              </label>
              <button type="submit" className={buttons.secondary} disabled={importPending}>
                {importPending ? l("savingCta") : l("importCta")}
              </button>
              <FormMessage error={importState?.error} success={importState?.success} />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

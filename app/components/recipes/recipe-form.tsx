"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { OwnerRecipePublishToolbar } from "@/app/components/owner/recipes/owner-recipe-publish-toolbar";
import { RecipeMediaField } from "@/app/components/owner/media/recipe-media-field";
import { RecipeImageFileInput } from "@/app/components/recipes/recipe-image-file-input";
import { buttons } from "@/lib/constants/styles";
import { translate } from "@/lib/i18n/format";
import { useTranslations } from "@/lib/i18n/translation-context";
import { createRecipeAction, updateRecipeAction, type RecipeActionState } from "@/lib/supabase/recipe-actions";
import {
  autosaveOwnerRecipeAction,
  createOwnerRecipeAction,
  updateOwnerRecipeAction,
  type OwnerRecipeActionState,
} from "@/lib/supabase/owner-recipe-actions";
import type { LookupOption, PourRow, RecipeFullDetail, RecipeImageRow } from "@/types/recipe";
import type { MediaFolder } from "@/types/media";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45";

const selectClass = `${inputClass} appearance-none`;
const labelClass = "text-sm font-medium text-stone-300";
const checkboxRowClass = "flex items-center gap-2.5 text-sm text-stone-300";
const checkboxClass = "h-4 w-4 rounded border-white/[0.2] bg-white/[0.03] text-amber-500 focus:ring-amber-500/40";

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mt-12 border-t border-white/[0.08] pt-8 first:mt-0 first:border-t-0 first:pt-0">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-500/80">{title}</h2>
      {description && <p className="mt-1.5 text-sm text-stone-500">{description}</p>}
    </div>
  );
}

type RecipeFormProps = {
  mode: "create" | "edit";
  variant?: "user" | "owner";
  recipeId?: string;
  initialValues?: RecipeFullDetail;
  versionCount?: number;
  brewingMethods: LookupOption[];
  devices: LookupOption[];
  grinders: LookupOption[];
  filterTypes: LookupOption[];
  waterProfiles: LookupOption[];
  origins: LookupOption[];
  roasters: LookupOption[];
  coffees: LookupOption[];
  tags: LookupOption[];
  mediaFolders?: MediaFolder[];
};

type PourFieldRow = { key: number; pour?: PourRow };

export function RecipeForm({
  mode,
  variant = "user",
  recipeId,
  initialValues,
  versionCount = 0,
  brewingMethods,
  devices,
  grinders,
  filterTypes,
  waterProfiles,
  origins,
  roasters,
  coffees,
  tags,
  mediaFolders = [],
}: RecipeFormProps) {
  const { t, dictionary } = useTranslations();
  const isOwner = variant === "owner";
  const optionalLabel = <span className="ml-1 text-xs text-stone-500">{t("recipeForm.optionalTag")}</span>;
  const action =
    mode === "create"
      ? isOwner
        ? createOwnerRecipeAction
        : createRecipeAction
      : isOwner
        ? updateOwnerRecipeAction
        : updateRecipeAction;
  const [state, formAction, pending] = useActionState<RecipeActionState | OwnerRecipeActionState, FormData>(
    action,
    undefined,
  );
  const [autosaveState, autosaveAction] = useActionState<OwnerRecipeActionState, FormData>(
    autosaveOwnerRecipeAction,
    undefined,
  );
  const [autosavePending, startAutosave] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false);
  const [publishIntent, setPublishIntent] = useState("draft");

  const initialPours = initialValues?.pours ?? [];
  const [pourRows, setPourRows] = useState<PourFieldRow[]>(() =>
    initialPours.length > 0
      ? initialPours.map((pour, index) => ({ key: index, pour }))
      : [{ key: 0 }],
  );
  const [pourKeyCounter, setPourKeyCounter] = useState(pourRows.length);

  const existingImages: RecipeImageRow[] = initialValues?.images ?? [];
  const selectedTagIds = new Set(initialValues?.tagIds ?? []);

  useEffect(() => {
    if (!isOwner || mode !== "edit") return;
    const form = formRef.current;
    if (!form) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const scheduleAutosave = () => {
      setDirty(true);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const formData = new FormData(form);
        startAutosave(() => {
          autosaveAction(formData);
        });
      }, 2500);
    };

    form.addEventListener("input", scheduleAutosave);
    form.addEventListener("change", scheduleAutosave);
    return () => {
      form.removeEventListener("input", scheduleAutosave);
      form.removeEventListener("change", scheduleAutosave);
      if (timeout) clearTimeout(timeout);
    };
  }, [autosaveAction, isOwner, mode, startAutosave]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const savedAtLabel =
    autosaveState?.savedAt &&
    translate(dictionary, "ownerRecipesPage.autosaveSavedAtTemplate", {
      time: new Date(autosaveState.savedAt).toLocaleTimeString(),
    });

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-7"
      onSubmit={() => setDirty(false)}
    >
      {recipeId && <input type="hidden" name="recipeId" value={recipeId} />}
      {isOwner ? <input type="hidden" name="publishIntent" value={publishIntent} /> : null}

      {/* GENERAL */}
      <SectionHeading title={t("recipeForm.sectionGeneral")} />

      <div>
        <label htmlFor="title" className={labelClass}>
          {t("recipeForm.recipeTitleLabel")}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialValues?.title ?? ""}
          className={inputClass}
          placeholder={t("recipeForm.recipeTitlePlaceholder")}
        />
      </div>

      {isOwner ? (
        <>
          <SectionHeading
            title={t("ownerRecipesPage.sectionSeo")}
            description={t("ownerRecipesPage.sectionSeoDescription")}
          />

          <div>
            <label htmlFor="slug" className={labelClass}>
              {t("ownerRecipesPage.slugLabel")}
              {optionalLabel}
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              defaultValue={initialValues?.slug ?? ""}
              className={inputClass}
              placeholder={t("ownerRecipesPage.slugPlaceholder")}
            />
            <p className="mt-1.5 text-xs text-stone-500">{t("ownerRecipesPage.slugHelp")}</p>
          </div>

          <div>
            <label htmlFor="seoTitle" className={labelClass}>
              {t("ownerRecipesPage.seoTitleLabel")}
              {optionalLabel}
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              type="text"
              defaultValue={initialValues?.seoTitle ?? ""}
              className={inputClass}
              placeholder={t("ownerRecipesPage.seoTitlePlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="seoDescription" className={labelClass}>
              {t("ownerRecipesPage.seoDescriptionLabel")}
              {optionalLabel}
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              rows={2}
              defaultValue={initialValues?.seoDescription ?? ""}
              className={inputClass}
              placeholder={t("ownerRecipesPage.seoDescriptionPlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="canonicalUrl" className={labelClass}>
              {t("ownerRecipesPage.canonicalUrlLabel")}
              {optionalLabel}
            </label>
            <input
              id="canonicalUrl"
              name="canonicalUrl"
              type="text"
              defaultValue={initialValues?.canonicalUrl ?? ""}
              className={inputClass}
              placeholder={t("ownerRecipesPage.canonicalUrlPlaceholder")}
            />
          </div>
        </>
      ) : null}

      <div>
        <label htmlFor="description" className={labelClass}>
          {t("recipeForm.descriptionLabel")}
          {optionalLabel}
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={initialValues?.description ?? ""}
          className={inputClass}
          placeholder={t("recipeForm.descriptionPlaceholder")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="difficulty" className={labelClass}>
            {t("recipeForm.difficultyLabel")}
          </label>
          <select id="difficulty" name="difficulty" defaultValue={initialValues?.difficulty ?? ""} className={selectClass}>
            <option value="">{t("recipeForm.notSetOption")}</option>
            <option value="Beginner">{t("recipeForm.beginnerOption")}</option>
            <option value="Intermediate">{t("recipeForm.intermediateOption")}</option>
            <option value="Advanced">{t("recipeForm.advancedOption")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="estimatedBrewTime" className={labelClass}>
            {t("recipeForm.estimatedBrewTimeLabel")}
          </label>
          <input
            id="estimatedBrewTime"
            name="estimatedBrewTime"
            type="text"
            defaultValue={initialValues?.estimatedBrewTime ?? ""}
            className={inputClass}
            placeholder="3:30"
          />
        </div>
        <div>
          <label htmlFor="videoUrl" className={labelClass}>
            {t("recipeForm.videoUrlLabel")}
            {optionalLabel}
          </label>
          <input
            id="videoUrl"
            name="videoUrl"
            type="url"
            defaultValue={initialValues?.videoUrl ?? ""}
            className={inputClass}
            placeholder={t("recipeForm.videoUrlPlaceholder")}
          />
        </div>
      </div>

      {/* FILES */}
      <SectionHeading title={t("recipeForm.sectionPhotos")} description={t("recipeForm.sectionPhotosDescription")} />

      {isOwner && mediaFolders.length > 0 ? (
        <RecipeMediaField
          folders={mediaFolders}
          coverImageUrl={initialValues?.coverImageUrl}
          coverMediaAssetId={initialValues?.coverMediaAssetId}
          coverImageBlur={initialValues?.coverImageBlur}
          galleryItems={existingImages
            .filter((image) => image.mediaAssetId)
            .map((image) => ({
              id: image.mediaAssetId as string,
              url: image.url,
              blurDataUrl: image.blurDataUrl,
            }))}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="coverImage" className={labelClass}>
              {t("recipeForm.coverPhotoLabel")}
              {optionalLabel}
            </label>
            {initialValues?.coverImageUrl && (
              <p className="mt-2 text-xs text-stone-500">{t("recipeForm.coverPhotoCurrentHint")}</p>
            )}
            <RecipeImageFileInput
              id="coverImage"
              name="coverImage"
              widthFieldName="coverImageWidth"
              heightFieldName="coverImageHeight"
              blurFieldName="coverImageBlur"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="mt-2 block text-sm text-stone-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/[0.08] file:px-4 file:py-2 file:text-xs file:font-medium file:text-stone-100 file:transition-colors hover:file:bg-white/[0.12]"
            />
          </div>
          <div>
            <label htmlFor="galleryImages" className={labelClass}>
              {t("recipeForm.additionalPhotosLabel")}
              {optionalLabel}
            </label>
            {existingImages.length > 0 && (
              <p className="mt-2 text-xs text-stone-500">
                {translate(dictionary, "recipeForm.additionalPhotosAttachedTemplate", { count: existingImages.length })}
              </p>
            )}
            <RecipeImageFileInput
              id="galleryImages"
              name="galleryImages"
              multiple
              metaFieldName="galleryImageMeta"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="mt-2 block text-sm text-stone-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/[0.08] file:px-4 file:py-2 file:text-xs file:font-medium file:text-stone-100 file:transition-colors hover:file:bg-white/[0.12]"
            />
          </div>
        </div>
      )}

      {/* COFFEE */}
      <SectionHeading title={t("recipeForm.sectionCoffee")} description={t("recipeForm.sectionCoffeeDescription")} />

      <div>
        <label htmlFor="coffeeId" className={labelClass}>
          {t("recipeForm.useExistingCoffeeLabel")}
        </label>
        <select id="coffeeId" name="coffeeId" defaultValue={initialValues?.coffeeId ?? ""} className={selectClass}>
          <option value="">{t("recipeForm.noneSelectedOption")}</option>
          {coffees.map((coffee) => (
            <option key={coffee.id} value={coffee.id}>
              {coffee.name}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-stone-500">{t("recipeForm.useExistingCoffeeHint")}</p>
      </div>

      <div>
        <label htmlFor="newCoffeeName" className={labelClass}>
          {t("recipeForm.newCoffeeNameLabel")}
          {optionalLabel}
        </label>
        <input
          id="newCoffeeName"
          name="newCoffeeName"
          type="text"
          className={inputClass}
          placeholder={t("recipeForm.newCoffeeNamePlaceholder")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="roasterId" className={labelClass}>
            {t("recipeForm.roasterLabel")}
            {optionalLabel}
          </label>
          <select id="roasterId" name="roasterId" defaultValue={initialValues?.roasterId ?? ""} className={selectClass}>
            <option value="">{t("recipeForm.noRoasterOption")}</option>
            {roasters.map((roaster) => (
              <option key={roaster.id} value={roaster.id}>
                {roaster.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="originId" className={labelClass}>
            {t("recipeForm.originLabel")}
            {optionalLabel}
          </label>
          <select id="originId" name="originId" defaultValue={initialValues?.originId ?? ""} className={selectClass}>
            <option value="">{t("recipeForm.noOriginOption")}</option>
            {origins.map((origin) => (
              <option key={origin.id} value={origin.id}>
                {origin.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="farm" className={labelClass}>
            {t("recipeForm.farmLabel")}
            {optionalLabel}
          </label>
          <input id="farm" name="farm" type="text" defaultValue={initialValues?.farm ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="producer" className={labelClass}>
            {t("recipeForm.producerLabel")}
            {optionalLabel}
          </label>
          <input
            id="producer"
            name="producer"
            type="text"
            defaultValue={initialValues?.producer ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="variety" className={labelClass}>
            {t("recipeForm.varietyLabel")}
            {optionalLabel}
          </label>
          <input
            id="variety"
            name="variety"
            type="text"
            defaultValue={initialValues?.variety ?? ""}
            className={inputClass}
            placeholder={t("recipeForm.varietyPlaceholder")}
          />
        </div>
        <div>
          <label htmlFor="process" className={labelClass}>
            {t("recipeForm.processLabel")}
            {optionalLabel}
          </label>
          <input
            id="process"
            name="process"
            type="text"
            defaultValue={initialValues?.process ?? ""}
            className={inputClass}
            placeholder={t("recipeForm.processPlaceholder")}
          />
        </div>
        <div>
          <label htmlFor="altitude" className={labelClass}>
            {t("recipeForm.altitudeLabel")}
            {optionalLabel}
          </label>
          <input
            id="altitude"
            name="altitude"
            type="text"
            defaultValue={initialValues?.altitude ?? ""}
            className={inputClass}
            placeholder={t("recipeForm.altitudePlaceholder")}
          />
        </div>
        <div>
          <label htmlFor="roastLevel" className={labelClass}>
            {t("recipeForm.roastLevelLabel")}
            {optionalLabel}
          </label>
          <input
            id="roastLevel"
            name="roastLevel"
            type="text"
            defaultValue={initialValues?.roastLevel ?? ""}
            className={inputClass}
            placeholder={t("recipeForm.roastLevelPlaceholder")}
          />
        </div>
      </div>

      <div>
        <label htmlFor="roastDate" className={labelClass}>
          {t("recipeForm.roastDateLabel")}
          {optionalLabel}
        </label>
        <input
          id="roastDate"
          name="roastDate"
          type="date"
          defaultValue={initialValues?.roastDate ?? ""}
          className={inputClass}
        />
      </div>

      {/* BREWING */}
      <SectionHeading title={t("recipeForm.sectionBrewing")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="brewingMethodId" className={labelClass}>
            {t("recipeForm.brewingMethodLabel")}
          </label>
          <select
            id="brewingMethodId"
            name="brewingMethodId"
            required
            defaultValue={initialValues?.brewingMethodId ?? ""}
            className={selectClass}
          >
            <option value="" disabled>
              {t("recipeForm.selectMethodOption")}
            </option>
            {brewingMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="deviceId" className={labelClass}>
            {t("recipeForm.brewerDeviceLabel")}
            {optionalLabel}
          </label>
          <select id="deviceId" name="deviceId" defaultValue={initialValues?.deviceId ?? ""} className={selectClass}>
            <option value="">{t("recipeForm.noDeviceOption")}</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="grinderId" className={labelClass}>
            {t("recipeForm.grinderLabel")}
            {optionalLabel}
          </label>
          <select id="grinderId" name="grinderId" defaultValue={initialValues?.grinderId ?? ""} className={selectClass}>
            <option value="">{t("recipeForm.noGrinderOption")}</option>
            {grinders.map((grinder) => (
              <option key={grinder.id} value={grinder.id}>
                {grinder.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filterTypeId" className={labelClass}>
            {t("recipeForm.filterTypeLabel")}
            {optionalLabel}
          </label>
          <select
            id="filterTypeId"
            name="filterTypeId"
            defaultValue={initialValues?.filterTypeId ?? ""}
            className={selectClass}
          >
            <option value="">{t("recipeForm.noFilterOption")}</option>
            {filterTypes.map((filterType) => (
              <option key={filterType.id} value={filterType.id}>
                {filterType.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="waterProfileId" className={labelClass}>
            {t("recipeForm.waterRecipeLabel")}
            {optionalLabel}
          </label>
          <select
            id="waterProfileId"
            name="waterProfileId"
            defaultValue={initialValues?.waterProfileId ?? ""}
            className={selectClass}
          >
            <option value="">{t("recipeForm.noWaterProfileOption")}</option>
            {waterProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="grindSize" className={labelClass}>
            {t("recipeForm.grindSizeLabel")}
          </label>
          <input
            id="grindSize"
            name="grindSize"
            type="text"
            defaultValue={initialValues?.grindSize ?? ""}
            className={inputClass}
            placeholder={t("recipeForm.grindSizePlaceholder")}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="coffeeDose" className={labelClass}>
            {t("recipeForm.coffeeDoseLabel")}
          </label>
          <input
            id="coffeeDose"
            name="coffeeDose"
            type="number"
            step="0.1"
            min="0"
            defaultValue={initialValues?.coffeeDose ?? ""}
            className={inputClass}
            placeholder="18"
          />
        </div>
        <div>
          <label htmlFor="waterAmount" className={labelClass}>
            {t("recipeForm.waterAmountLabel")}
          </label>
          <input
            id="waterAmount"
            name="waterAmount"
            type="number"
            step="0.1"
            min="0"
            defaultValue={initialValues?.waterAmount ?? ""}
            className={inputClass}
            placeholder="288"
          />
        </div>
        <div>
          <label htmlFor="ratio" className={labelClass}>
            {t("recipeForm.brewRatioLabel")}
            {optionalLabel}
          </label>
          <input
            id="ratio"
            name="ratio"
            type="text"
            defaultValue={initialValues?.ratio ?? ""}
            className={inputClass}
            placeholder="1:16"
          />
        </div>
        <div>
          <label htmlFor="waterTemperature" className={labelClass}>
            {t("recipeForm.waterTempLabel")}
          </label>
          <input
            id="waterTemperature"
            name="waterTemperature"
            type="number"
            step="0.1"
            defaultValue={initialValues?.waterTemperature ?? ""}
            className={inputClass}
            placeholder="94"
          />
        </div>
        <div>
          <label htmlFor="iceAmount" className={labelClass}>
            {t("recipeForm.iceAmountLabel")}
            {optionalLabel}
          </label>
          <input
            id="iceAmount"
            name="iceAmount"
            type="number"
            step="0.1"
            min="0"
            defaultValue={initialValues?.iceAmount ?? ""}
            className={inputClass}
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor="bloomAmount" className={labelClass}>
            {t("recipeForm.bloomAmountLabel")}
            {optionalLabel}
          </label>
          <input
            id="bloomAmount"
            name="bloomAmount"
            type="number"
            step="0.1"
            min="0"
            defaultValue={initialValues?.bloomAmount ?? ""}
            className={inputClass}
            placeholder="30"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bloomTime" className={labelClass}>
          {t("recipeForm.bloomTimeLabel")}
          {optionalLabel}
        </label>
        <input
          id="bloomTime"
          name="bloomTime"
          type="text"
          defaultValue={initialValues?.bloomTime ?? ""}
          className={inputClass}
          placeholder={t("recipeForm.bloomTimePlaceholder")}
        />
      </div>

      {/* POUR STRUCTURE */}
      <SectionHeading
        title={t("recipeForm.sectionPourStructure")}
        description={t("recipeForm.sectionPourStructureDescription")}
      />

      <input type="hidden" name="pourCount" value={pourRows.length} />

      <div className="space-y-4">
        {pourRows.map((row, index) => (
          <div key={row.key} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-stone-500">
                {translate(dictionary, "recipeForm.pourLabelTemplate", { number: index + 1 })}
              </p>
              {pourRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setPourRows((rows) => rows.filter((r) => r.key !== row.key))}
                  className="text-xs font-medium text-red-400/80 underline-offset-4 hover:text-red-400 hover:underline"
                >
                  {t("recipeForm.removePour")}
                </button>
              )}
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor={`pourWater_${index}`} className="text-xs text-stone-400">
                  {t("recipeForm.pourWaterLabel")}
                </label>
                <input
                  id={`pourWater_${index}`}
                  name={`pourWater_${index}`}
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={row.pour?.water_amount ?? ""}
                  className={`${inputClass} mt-1.5 py-2.5`}
                />
              </div>
              <div>
                <label htmlFor={`pourTime_${index}`} className="text-xs text-stone-400">
                  {t("recipeForm.pourTimeLabel")}
                </label>
                <input
                  id={`pourTime_${index}`}
                  name={`pourTime_${index}`}
                  type="text"
                  defaultValue={row.pour?.time_label ?? ""}
                  className={`${inputClass} mt-1.5 py-2.5`}
                  placeholder="0:30"
                />
              </div>
              <div>
                <label htmlFor={`pourNotes_${index}`} className="text-xs text-stone-400">
                  {t("recipeForm.pourNotesLabel")}
                </label>
                <input
                  id={`pourNotes_${index}`}
                  name={`pourNotes_${index}`}
                  type="text"
                  defaultValue={row.pour?.notes ?? ""}
                  className={`${inputClass} mt-1.5 py-2.5`}
                  placeholder={t("recipeForm.pourNotesPlaceholder")}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setPourRows((rows) => [...rows, { key: pourKeyCounter }]);
          setPourKeyCounter((count) => count + 1);
        }}
        className={`${buttons.secondary} h-10 min-w-0 px-5 text-xs`}
      >
        {t("recipeForm.addPourCta")}
      </button>

      {/* RESULTS */}
      <SectionHeading title={t("recipeForm.sectionResults")} description={t("recipeForm.sectionResultsDescription")} />

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="totalBrewTime" className={labelClass}>
            {t("recipeForm.totalBrewTimeLabel")}
            {optionalLabel}
          </label>
          <input
            id="totalBrewTime"
            name="totalBrewTime"
            type="text"
            defaultValue={initialValues?.totalBrewTime ?? ""}
            className={inputClass}
            placeholder="3:45"
          />
        </div>
        <div>
          <label htmlFor="beverageWeight" className={labelClass}>
            {t("recipeForm.beverageWeightLabel")}
            {optionalLabel}
          </label>
          <input
            id="beverageWeight"
            name="beverageWeight"
            type="number"
            step="0.1"
            min="0"
            defaultValue={initialValues?.beverageWeight ?? ""}
            className={inputClass}
            placeholder="260"
          />
        </div>
        <div>
          <label htmlFor="tds" className={labelClass}>
            {t("recipeForm.tdsLabel")}
            {optionalLabel}
          </label>
          <input
            id="tds"
            name="tds"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initialValues?.tds ?? ""}
            className={inputClass}
            placeholder="1.35"
          />
        </div>
        <div>
          <label htmlFor="extractionPercentage" className={labelClass}>
            {t("recipeForm.extractionLabel")}
            {optionalLabel}
          </label>
          <input
            id="extractionPercentage"
            name="extractionPercentage"
            type="number"
            step="0.1"
            min="0"
            defaultValue={initialValues?.extractionPercentage ?? ""}
            className={inputClass}
            placeholder="20.5"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-4">
        {(
          [
            { field: "sweetness", labelKey: "sweetnessLabel" },
            { field: "acidity", labelKey: "acidityLabel" },
            { field: "body", labelKey: "bodyLabel" },
            { field: "bitterness", labelKey: "bitternessLabel" },
          ] as const
        ).map(({ field, labelKey }) => (
          <div key={field}>
            <label htmlFor={field} className={labelClass}>
              {t(`recipeForm.${labelKey}`)}
              {optionalLabel}
            </label>
            <input
              id={field}
              name={field}
              type="number"
              min="1"
              max="10"
              step="1"
              defaultValue={initialValues?.[field] ?? ""}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="tastingNotes" className={labelClass}>
          {t("recipeForm.flavorNotesLabel")}
        </label>
        <textarea
          id="tastingNotes"
          name="tastingNotes"
          rows={3}
          defaultValue={initialValues?.tastingNotes ?? ""}
          className={inputClass}
          placeholder={t("recipeForm.flavorNotesPlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="instructions" className={labelClass}>
          {t("recipeForm.additionalInstructionsLabel")}
          {optionalLabel}
        </label>
        <textarea
          id="instructions"
          name="instructions"
          rows={4}
          defaultValue={initialValues?.instructions ?? ""}
          className={inputClass}
          placeholder={t("recipeForm.additionalInstructionsPlaceholder")}
        />
      </div>

      {/* TAGS */}
      <SectionHeading title={t("recipeForm.sectionTags")} />

      <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-4">
        {tags.map((tag) => (
          <label key={tag.id} className={checkboxRowClass}>
            <input
              type="checkbox"
              name="tagIds"
              value={tag.id}
              defaultChecked={selectedTagIds.has(tag.id)}
              className={checkboxClass}
            />
            {tag.name}
          </label>
        ))}
      </div>

      {/* STATUS */}
      <SectionHeading title={t("recipeForm.sectionStatus")} />

      {isOwner ? (
        <OwnerRecipePublishToolbar
          recipeId={recipeId}
          status={initialValues?.status ?? "draft"}
          scheduledPublishAt={initialValues?.scheduledPublishAt}
          versionCount={versionCount}
          pending={pending}
          onIntentChange={setPublishIntent}
        />
      ) : null}

      <div className="flex flex-wrap gap-6 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-4">
        {!isOwner ? (
          <label className={checkboxRowClass}>
            <input
              type="checkbox"
              name="published"
              defaultChecked={initialValues?.published ?? false}
              className={checkboxClass}
            />
            {t("recipeForm.publishedCheckboxLabel")}
          </label>
        ) : null}
        <label className={checkboxRowClass}>
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initialValues?.featured ?? false}
            className={checkboxClass}
          />
          {t("recipeForm.featuredCheckboxLabel")}
        </label>
        <label className={checkboxRowClass}>
          <input
            type="checkbox"
            name="premiumOnly"
            defaultChecked={initialValues?.premiumOnly ?? false}
            className={checkboxClass}
          />
          {t("recipeForm.premiumOnlyCheckboxLabel")}
        </label>
      </div>

      <FormMessage error={state?.error ?? autosaveState?.error} success={state?.success} />

      {isOwner && mode === "edit" ? (
        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
          {autosavePending ? (
            <span>{t("ownerRecipesPage.autosaveSaving")}</span>
          ) : savedAtLabel ? (
            <span className="text-emerald-400/90">{savedAtLabel}</span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        {isOwner ? (
          <Link
            href="/admin/recipes"
            className={`${buttons.secondary} w-full sm:w-auto`}
            onClick={(event) => {
              if (dirty && !window.confirm(t("ownerRecipesPage.unsavedChangesWarning"))) {
                event.preventDefault();
              }
            }}
          >
            {t("ownerRecipesPage.cancelCta")}
          </Link>
        ) : null}
        {!isOwner ? (
          <button type="submit" disabled={pending} className={`${buttons.primary} w-full disabled:opacity-70 sm:w-auto`}>
            {pending
              ? t("recipeForm.savingCta")
              : mode === "create"
                ? t("recipeForm.createRecipeCta")
                : t("recipeForm.saveChangesCta")}
          </button>
        ) : null}
      </div>
    </form>
  );
}

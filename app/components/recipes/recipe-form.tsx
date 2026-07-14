"use client";

import { useActionState, useState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons } from "@/lib/constants/styles";
import { createRecipeAction, updateRecipeAction, type RecipeActionState } from "@/lib/supabase/recipe-actions";
import type { LookupOption, PourRow, RecipeFullDetail, RecipeImageRow } from "@/types/recipe";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45";

const selectClass = `${inputClass} appearance-none`;
const labelClass = "text-sm font-medium text-stone-300";
const optionalLabel = <span className="ml-1 text-xs text-stone-500">(optional)</span>;
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
  recipeId?: string;
  initialValues?: RecipeFullDetail;
  brewingMethods: LookupOption[];
  devices: LookupOption[];
  grinders: LookupOption[];
  filterTypes: LookupOption[];
  waterProfiles: LookupOption[];
  origins: LookupOption[];
  roasters: LookupOption[];
  coffees: LookupOption[];
  tags: LookupOption[];
};

type PourFieldRow = { key: number; pour?: PourRow };

export function RecipeForm({
  mode,
  recipeId,
  initialValues,
  brewingMethods,
  devices,
  grinders,
  filterTypes,
  waterProfiles,
  origins,
  roasters,
  coffees,
  tags,
}: RecipeFormProps) {
  const action = mode === "create" ? createRecipeAction : updateRecipeAction;
  const [state, formAction, pending] = useActionState<RecipeActionState, FormData>(action, undefined);

  const initialPours = initialValues?.pours ?? [];
  const [pourRows, setPourRows] = useState<PourFieldRow[]>(() =>
    initialPours.length > 0
      ? initialPours.map((pour, index) => ({ key: index, pour }))
      : [{ key: 0 }],
  );
  const [pourKeyCounter, setPourKeyCounter] = useState(pourRows.length);

  const existingImages: RecipeImageRow[] = initialValues?.images ?? [];
  const selectedTagIds = new Set(initialValues?.tagIds ?? []);

  return (
    <form action={formAction} className="space-y-7">
      {recipeId && <input type="hidden" name="recipeId" value={recipeId} />}

      {/* GENERAL */}
      <SectionHeading title="General" />

      <div>
        <label htmlFor="title" className={labelClass}>
          Recipe title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialValues?.title ?? ""}
          className={inputClass}
          placeholder="Ethiopian Yirgacheffe Pour Over"
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
          {optionalLabel}
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={initialValues?.description ?? ""}
          className={inputClass}
          placeholder="A bright, jasmine-forward pour over highlighting the coffee's natural terroir."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="difficulty" className={labelClass}>
            Difficulty
          </label>
          <select id="difficulty" name="difficulty" defaultValue={initialValues?.difficulty ?? ""} className={selectClass}>
            <option value="">Not set</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label htmlFor="estimatedBrewTime" className={labelClass}>
            Estimated brew time
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
            Video URL
            {optionalLabel}
          </label>
          <input
            id="videoUrl"
            name="videoUrl"
            type="url"
            defaultValue={initialValues?.videoUrl ?? ""}
            className={inputClass}
            placeholder="https://youtube.com/..."
          />
        </div>
      </div>

      {/* FILES */}
      <SectionHeading title="Photos" description="Upload a cover photo and any additional shots of the brew." />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="coverImage" className={labelClass}>
            Cover photo
            {optionalLabel}
          </label>
          {initialValues?.coverImageUrl && (
            <p className="mt-2 text-xs text-stone-500">Current cover is set. Choose a new file to replace it.</p>
          )}
          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="mt-2 block text-sm text-stone-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/[0.08] file:px-4 file:py-2 file:text-xs file:font-medium file:text-stone-100 file:transition-colors hover:file:bg-white/[0.12]"
          />
        </div>
        <div>
          <label htmlFor="galleryImages" className={labelClass}>
            Additional photos
            {optionalLabel}
          </label>
          {existingImages.length > 0 && (
            <p className="mt-2 text-xs text-stone-500">{existingImages.length} photo(s) already attached. New uploads will be added alongside them.</p>
          )}
          <input
            id="galleryImages"
            name="galleryImages"
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="mt-2 block text-sm text-stone-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/[0.08] file:px-4 file:py-2 file:text-xs file:font-medium file:text-stone-100 file:transition-colors hover:file:bg-white/[0.12]"
          />
        </div>
      </div>

      {/* COFFEE */}
      <SectionHeading title="Coffee" description="Pick a coffee you've already logged, or describe a new one below." />

      <div>
        <label htmlFor="coffeeId" className={labelClass}>
          Use an existing coffee
        </label>
        <select id="coffeeId" name="coffeeId" defaultValue={initialValues?.coffeeId ?? ""} className={selectClass}>
          <option value="">None selected</option>
          {coffees.map((coffee) => (
            <option key={coffee.id} value={coffee.id}>
              {coffee.name}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-stone-500">
          Leave the fields below blank to reuse this selection, or fill in &quot;New coffee name&quot; to log a new one.
        </p>
      </div>

      <div>
        <label htmlFor="newCoffeeName" className={labelClass}>
          New coffee name
          {optionalLabel}
        </label>
        <input
          id="newCoffeeName"
          name="newCoffeeName"
          type="text"
          className={inputClass}
          placeholder="Gedeo Zone Natural Lot 4"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="roasterId" className={labelClass}>
            Roaster
            {optionalLabel}
          </label>
          <select id="roasterId" name="roasterId" defaultValue={initialValues?.roasterId ?? ""} className={selectClass}>
            <option value="">No roaster specified</option>
            {roasters.map((roaster) => (
              <option key={roaster.id} value={roaster.id}>
                {roaster.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="originId" className={labelClass}>
            Origin
            {optionalLabel}
          </label>
          <select id="originId" name="originId" defaultValue={initialValues?.originId ?? ""} className={selectClass}>
            <option value="">No origin specified</option>
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
            Farm
            {optionalLabel}
          </label>
          <input id="farm" name="farm" type="text" defaultValue={initialValues?.farm ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="producer" className={labelClass}>
            Producer
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
            Variety
            {optionalLabel}
          </label>
          <input
            id="variety"
            name="variety"
            type="text"
            defaultValue={initialValues?.variety ?? ""}
            className={inputClass}
            placeholder="Heirloom, Bourbon, Gesha…"
          />
        </div>
        <div>
          <label htmlFor="process" className={labelClass}>
            Process
            {optionalLabel}
          </label>
          <input
            id="process"
            name="process"
            type="text"
            defaultValue={initialValues?.process ?? ""}
            className={inputClass}
            placeholder="Washed, Natural, Honey…"
          />
        </div>
        <div>
          <label htmlFor="altitude" className={labelClass}>
            Altitude
            {optionalLabel}
          </label>
          <input
            id="altitude"
            name="altitude"
            type="text"
            defaultValue={initialValues?.altitude ?? ""}
            className={inputClass}
            placeholder="1,900m"
          />
        </div>
        <div>
          <label htmlFor="roastLevel" className={labelClass}>
            Roast level
            {optionalLabel}
          </label>
          <input
            id="roastLevel"
            name="roastLevel"
            type="text"
            defaultValue={initialValues?.roastLevel ?? ""}
            className={inputClass}
            placeholder="Light Roast"
          />
        </div>
      </div>

      <div>
        <label htmlFor="roastDate" className={labelClass}>
          Roast date
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
      <SectionHeading title="Brewing" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="brewingMethodId" className={labelClass}>
            Brewing method
          </label>
          <select
            id="brewingMethodId"
            name="brewingMethodId"
            required
            defaultValue={initialValues?.brewingMethodId ?? ""}
            className={selectClass}
          >
            <option value="" disabled>
              Select a method
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
            Brewer device
            {optionalLabel}
          </label>
          <select id="deviceId" name="deviceId" defaultValue={initialValues?.deviceId ?? ""} className={selectClass}>
            <option value="">No device specified</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="grinderId" className={labelClass}>
            Grinder
            {optionalLabel}
          </label>
          <select id="grinderId" name="grinderId" defaultValue={initialValues?.grinderId ?? ""} className={selectClass}>
            <option value="">No grinder specified</option>
            {grinders.map((grinder) => (
              <option key={grinder.id} value={grinder.id}>
                {grinder.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filterTypeId" className={labelClass}>
            Filter type
            {optionalLabel}
          </label>
          <select
            id="filterTypeId"
            name="filterTypeId"
            defaultValue={initialValues?.filterTypeId ?? ""}
            className={selectClass}
          >
            <option value="">No filter specified</option>
            {filterTypes.map((filterType) => (
              <option key={filterType.id} value={filterType.id}>
                {filterType.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="waterProfileId" className={labelClass}>
            Water recipe
            {optionalLabel}
          </label>
          <select
            id="waterProfileId"
            name="waterProfileId"
            defaultValue={initialValues?.waterProfileId ?? ""}
            className={selectClass}
          >
            <option value="">No water profile specified</option>
            {waterProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="grindSize" className={labelClass}>
            Grind size
          </label>
          <input
            id="grindSize"
            name="grindSize"
            type="text"
            defaultValue={initialValues?.grindSize ?? ""}
            className={inputClass}
            placeholder="Medium-fine"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="coffeeDose" className={labelClass}>
            Coffee dose (g)
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
            Water amount (g)
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
            Brew ratio
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
            Water temp (°C)
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
            Ice amount (g)
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
            Bloom amount (g)
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
          Bloom time
          {optionalLabel}
        </label>
        <input
          id="bloomTime"
          name="bloomTime"
          type="text"
          defaultValue={initialValues?.bloomTime ?? ""}
          className={inputClass}
          placeholder="0:30"
        />
      </div>

      {/* POUR STRUCTURE */}
      <SectionHeading title="Pour Structure" description="Add as many pours as your recipe needs." />

      <input type="hidden" name="pourCount" value={pourRows.length} />

      <div className="space-y-4">
        {pourRows.map((row, index) => (
          <div key={row.key} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-stone-500">Pour {index + 1}</p>
              {pourRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setPourRows((rows) => rows.filter((r) => r.key !== row.key))}
                  className="text-xs font-medium text-red-400/80 underline-offset-4 hover:text-red-400 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor={`pourWater_${index}`} className="text-xs text-stone-400">
                  Water (g)
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
                  Time
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
                  Notes
                </label>
                <input
                  id={`pourNotes_${index}`}
                  name={`pourNotes_${index}`}
                  type="text"
                  defaultValue={row.pour?.notes ?? ""}
                  className={`${inputClass} mt-1.5 py-2.5`}
                  placeholder="Slow circular pour"
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
        + Add Pour
      </button>

      {/* RESULTS */}
      <SectionHeading title="Results" description="Log how the brew actually turned out." />

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="totalBrewTime" className={labelClass}>
            Total brew time
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
            Beverage weight (g)
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
            TDS (%)
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
            Extraction %
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
        {(["sweetness", "acidity", "body", "bitterness"] as const).map((field) => (
          <div key={field}>
            <label htmlFor={field} className={labelClass}>
              {field.charAt(0).toUpperCase() + field.slice(1)} (1-10)
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
          Flavor notes
        </label>
        <textarea
          id="tastingNotes"
          name="tastingNotes"
          rows={3}
          defaultValue={initialValues?.tastingNotes ?? ""}
          className={inputClass}
          placeholder="Jasmine, bergamot, and stone fruit with a silky finish."
        />
      </div>

      <div>
        <label htmlFor="instructions" className={labelClass}>
          Additional instructions
          {optionalLabel}
        </label>
        <textarea
          id="instructions"
          name="instructions"
          rows={4}
          defaultValue={initialValues?.instructions ?? ""}
          className={inputClass}
          placeholder="Any extra tips beyond the pour structure above…"
        />
      </div>

      {/* TAGS */}
      <SectionHeading title="Tags" />

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
      <SectionHeading title="Status" />

      <div className="flex flex-wrap gap-6 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-4">
        <label className={checkboxRowClass}>
          <input
            type="checkbox"
            name="published"
            defaultChecked={initialValues?.published ?? false}
            className={checkboxClass}
          />
          Published (visible to everyone)
        </label>
        <label className={checkboxRowClass}>
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initialValues?.featured ?? false}
            className={checkboxClass}
          />
          Featured
        </label>
        <label className={checkboxRowClass}>
          <input
            type="checkbox"
            name="premiumOnly"
            defaultChecked={initialValues?.premiumOnly ?? false}
            className={checkboxClass}
          />
          Premium only
        </label>
      </div>

      <FormMessage error={state?.error} success={state?.success} />

      <button type="submit" disabled={pending} className={`${buttons.primary} w-full disabled:opacity-70 sm:w-auto`}>
        {pending ? "Saving…" : mode === "create" ? "Create Recipe" : "Save Changes"}
      </button>
    </form>
  );
}

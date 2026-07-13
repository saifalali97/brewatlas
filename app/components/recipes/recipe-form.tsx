"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons } from "@/lib/constants/styles";
import { createRecipeAction, updateRecipeAction, type RecipeActionState } from "@/lib/supabase/recipe-actions";
import type { LookupOption } from "@/types/recipe";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45";

const selectClass = `${inputClass} appearance-none`;

const labelClass = "text-sm font-medium text-stone-300";

const checkboxRowClass = "flex items-center gap-2.5 text-sm text-stone-300";

const checkboxClass =
  "h-4 w-4 rounded border-white/[0.2] bg-white/[0.03] text-amber-500 focus:ring-amber-500/40";

export type RecipeFormInitialValues = {
  title: string;
  brewingMethodId: string;
  deviceId: string | null;
  originId: string | null;
  roasterId: string | null;
  coffeeDose: number | null;
  water: number | null;
  ice: number | null;
  grindSize: string | null;
  temperature: number | null;
  bloom: string | null;
  brewTime: string | null;
  tastingNotes: string | null;
  instructions: string | null;
  imageUrl: string | null;
  featured: boolean;
  premiumOnly: boolean;
  published: boolean;
};

type RecipeFormProps = {
  mode: "create" | "edit";
  recipeId?: string;
  initialValues?: RecipeFormInitialValues;
  brewingMethods: LookupOption[];
  devices: LookupOption[];
  origins: LookupOption[];
  roasters: LookupOption[];
};

const emptyValues: RecipeFormInitialValues = {
  title: "",
  brewingMethodId: "",
  deviceId: null,
  originId: null,
  roasterId: null,
  coffeeDose: null,
  water: null,
  ice: null,
  grindSize: null,
  temperature: null,
  bloom: null,
  brewTime: null,
  tastingNotes: null,
  instructions: null,
  imageUrl: null,
  featured: false,
  premiumOnly: false,
  published: false,
};

export function RecipeForm({
  mode,
  recipeId,
  initialValues = emptyValues,
  brewingMethods,
  devices,
  origins,
  roasters,
}: RecipeFormProps) {
  const action = mode === "create" ? createRecipeAction : updateRecipeAction;
  const [state, formAction, pending] = useActionState<RecipeActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-7">
      {recipeId && <input type="hidden" name="recipeId" value={recipeId} />}

      <div>
        <label htmlFor="title" className={labelClass}>
          Recipe title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialValues.title}
          className={inputClass}
          placeholder="Ethiopian Yirgacheffe Pour Over"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="brewingMethodId" className={labelClass}>
            Brewing method
          </label>
          <select
            id="brewingMethodId"
            name="brewingMethodId"
            required
            defaultValue={initialValues.brewingMethodId}
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
            Device
            <span className="ml-1 text-xs text-stone-500">(optional)</span>
          </label>
          <select
            id="deviceId"
            name="deviceId"
            defaultValue={initialValues.deviceId ?? ""}
            className={selectClass}
          >
            <option value="">No device specified</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="originId" className={labelClass}>
            Coffee origin
            <span className="ml-1 text-xs text-stone-500">(optional)</span>
          </label>
          <select
            id="originId"
            name="originId"
            defaultValue={initialValues.originId ?? ""}
            className={selectClass}
          >
            <option value="">No origin specified</option>
            {origins.map((origin) => (
              <option key={origin.id} value={origin.id}>
                {origin.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="roasterId" className={labelClass}>
            Roaster
            <span className="ml-1 text-xs text-stone-500">(optional)</span>
          </label>
          <select
            id="roasterId"
            name="roasterId"
            defaultValue={initialValues.roasterId ?? ""}
            className={selectClass}
          >
            <option value="">No roaster specified</option>
            {roasters.map((roaster) => (
              <option key={roaster.id} value={roaster.id}>
                {roaster.name}
              </option>
            ))}
          </select>
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
            defaultValue={initialValues.coffeeDose ?? ""}
            className={inputClass}
            placeholder="18"
          />
        </div>
        <div>
          <label htmlFor="water" className={labelClass}>
            Water (g)
          </label>
          <input
            id="water"
            name="water"
            type="number"
            step="0.1"
            min="0"
            defaultValue={initialValues.water ?? ""}
            className={inputClass}
            placeholder="288"
          />
        </div>
        <div>
          <label htmlFor="ice" className={labelClass}>
            Ice (g)
            <span className="ml-1 text-xs text-stone-500">(optional)</span>
          </label>
          <input
            id="ice"
            name="ice"
            type="number"
            step="0.1"
            min="0"
            defaultValue={initialValues.ice ?? ""}
            className={inputClass}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="grindSize" className={labelClass}>
            Grind size
          </label>
          <input
            id="grindSize"
            name="grindSize"
            type="text"
            defaultValue={initialValues.grindSize ?? ""}
            className={inputClass}
            placeholder="Medium-fine"
          />
        </div>
        <div>
          <label htmlFor="temperature" className={labelClass}>
            Water temp (°C)
          </label>
          <input
            id="temperature"
            name="temperature"
            type="number"
            step="0.1"
            defaultValue={initialValues.temperature ?? ""}
            className={inputClass}
            placeholder="94"
          />
        </div>
        <div>
          <label htmlFor="brewTime" className={labelClass}>
            Total brew time
          </label>
          <input
            id="brewTime"
            name="brewTime"
            type="text"
            defaultValue={initialValues.brewTime ?? ""}
            className={inputClass}
            placeholder="3:30"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bloom" className={labelClass}>
          Bloom
          <span className="ml-1 text-xs text-stone-500">(optional)</span>
        </label>
        <input
          id="bloom"
          name="bloom"
          type="text"
          defaultValue={initialValues.bloom ?? ""}
          className={inputClass}
          placeholder="30g water, 30s bloom"
        />
      </div>

      <div>
        <label htmlFor="tastingNotes" className={labelClass}>
          Tasting notes
        </label>
        <textarea
          id="tastingNotes"
          name="tastingNotes"
          rows={3}
          defaultValue={initialValues.tastingNotes ?? ""}
          className={inputClass}
          placeholder="Jasmine, bergamot, and stone fruit with a silky finish."
        />
      </div>

      <div>
        <label htmlFor="instructions" className={labelClass}>
          Step-by-step instructions
          <span className="ml-1 text-xs text-stone-500">(optional)</span>
        </label>
        <textarea
          id="instructions"
          name="instructions"
          rows={5}
          defaultValue={initialValues.instructions ?? ""}
          className={inputClass}
          placeholder="1. Rinse filter... 2. Bloom for 30s... 3. Pour in slow circles..."
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className={labelClass}>
          Image URL
          <span className="ml-1 text-xs text-stone-500">(optional)</span>
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={initialValues.imageUrl ?? ""}
          className={inputClass}
          placeholder="https://images.unsplash.com/..."
        />
      </div>

      <div className="flex flex-wrap gap-6 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-4">
        <label className={checkboxRowClass}>
          <input
            type="checkbox"
            name="published"
            defaultChecked={initialValues.published}
            className={checkboxClass}
          />
          Published (visible to everyone)
        </label>
        <label className={checkboxRowClass}>
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initialValues.featured}
            className={checkboxClass}
          />
          Featured
        </label>
        <label className={checkboxRowClass}>
          <input
            type="checkbox"
            name="premiumOnly"
            defaultChecked={initialValues.premiumOnly}
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

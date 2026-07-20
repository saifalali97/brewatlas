"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import {
  createBrewSessionAction,
  deleteBrewSessionAction,
  updateBrewSessionAction,
  type BrewSessionActionState,
} from "@/lib/supabase/brew-session-actions";
import type { BrewSessionDetail } from "@/types/brew-sessions";
import type { LookupOption } from "@/types/recipe";

type StepDraft = {
  stepNumber: number;
  action: string;
  waterAdded: string;
  duration: string;
  notes: string;
};

type PhotoDraft = {
  imageUrl: string;
  caption: string;
};

type BrewSessionFormProps = {
  mode: "create" | "edit";
  session?: BrewSessionDetail;
  initialRecipeId?: string;
  initialBrewMethod?: string;
  defaults: {
    brewer: string;
    grinder: string;
    kettle: string;
    filter: string;
    ratio: string;
    temperature: string;
  };
  recipes: LookupOption[];
  roastLevels: string[];
  processes: string[];
  brewingMethods: LookupOption[];
};

const RATING_OPTIONS = ["1", "2", "3", "4", "5"] as const;

export function BrewSessionForm({
  mode,
  session,
  initialRecipeId,
  initialBrewMethod,
  defaults,
  recipes,
  roastLevels,
  processes,
  brewingMethods,
}: BrewSessionFormProps) {
  const { t } = useTranslations();
  const l = (key: string) => t(`brewSessionsPage.${key}` as never);
  const action = mode === "create" ? createBrewSessionAction : updateBrewSessionAction;
  const [state, formAction, pending] = useActionState<BrewSessionActionState, FormData>(action, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState<BrewSessionActionState, FormData>(
    deleteBrewSessionAction,
    undefined,
  );

  const [steps, setSteps] = useState<StepDraft[]>(
    session?.steps.map((step) => ({
      stepNumber: step.stepNumber,
      action: step.action,
      waterAdded: step.waterAdded != null ? String(step.waterAdded) : "",
      duration: step.duration ?? "",
      notes: step.notes ?? "",
    })) ?? [{ stepNumber: 1, action: "Bloom", waterAdded: "", duration: "30s", notes: "" }],
  );

  const [photos, setPhotos] = useState<PhotoDraft[]>(
    session?.photos.map((photo) => ({ imageUrl: photo.imageUrl, caption: photo.caption ?? "" })) ?? [],
  );

  const stepsJson = useMemo(
    () =>
      JSON.stringify(
        steps
          .filter((step) => step.action.trim())
          .map((step, index) => ({
            stepNumber: index + 1,
            action: step.action.trim(),
            waterAdded: step.waterAdded ? Number.parseFloat(step.waterAdded) : null,
            duration: step.duration || null,
            notes: step.notes || null,
          })),
      ),
    [steps],
  );

  const photosJson = useMemo(
    () =>
      JSON.stringify(
        photos
          .filter((photo) => photo.imageUrl.trim())
          .map((photo) => ({ imageUrl: photo.imageUrl.trim(), caption: photo.caption || null })),
      ),
    [photos],
  );

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-7">
        {mode === "edit" && session ? <input type="hidden" name="sessionId" value={session.id} /> : null}
        <input type="hidden" name="stepsJson" value={stepsJson} />
        <input type="hidden" name="photosJson" value={photosJson} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="coffeeName" className={forms.label}>{l("coffeeLabel")}</label>
            <input id="coffeeName" name="coffeeName" type="text" defaultValue={session?.coffeeName ?? ""} className={forms.input} />
          </div>
          <div>
            <label htmlFor="roaster" className={forms.label}>{l("roasterLabel")}</label>
            <input id="roaster" name="roaster" type="text" defaultValue={session?.roaster ?? ""} className={forms.input} />
          </div>
          <div>
            <label htmlFor="origin" className={forms.label}>{l("originLabel")}</label>
            <input id="origin" name="origin" type="text" defaultValue={session?.origin ?? ""} className={forms.input} />
          </div>
          <div>
            <label htmlFor="roastLevel" className={forms.label}>{l("roastLevelLabel")}</label>
            <input id="roastLevel" name="roastLevel" list="roastLevels" defaultValue={session?.roastLevel ?? ""} className={forms.input} />
            <datalist id="roastLevels">{roastLevels.map((level) => <option key={level} value={level} />)}</datalist>
          </div>
          <div>
            <label htmlFor="processing" className={forms.label}>{l("processingLabel")}</label>
            <input id="processing" name="processing" list="processes" defaultValue={session?.processing ?? ""} className={forms.input} />
            <datalist id="processes">{processes.map((process) => <option key={process} value={process} />)}</datalist>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="recipeId" className={forms.label}>{l("recipeLabel")}</label>
            <select id="recipeId" name="recipeId" defaultValue={session?.recipeId ?? initialRecipeId ?? ""} className={forms.select}>
              <option value="">{l("notSetOption")}</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="brewMethod" className={forms.label}>{l("brewMethodLabel")}</label>
            <input id="brewMethod" name="brewMethod" list="brewMethods" defaultValue={session?.brewMethod ?? initialBrewMethod ?? ""} className={forms.input} />
            <datalist id="brewMethods">{brewingMethods.map((method) => <option key={method.id} value={method.name} />)}</datalist>
          </div>
          <div>
            <label htmlFor="grinder" className={forms.label}>{l("grinderLabel")}</label>
            <input id="grinder" name="grinder" type="text" defaultValue={session?.grinder ?? defaults.grinder} className={forms.input} />
          </div>
          <div>
            <label htmlFor="brewer" className={forms.label}>{l("brewerLabel")}</label>
            <input id="brewer" name="brewer" type="text" defaultValue={session?.brewer ?? defaults.brewer} className={forms.input} />
          </div>
          <div>
            <label htmlFor="kettle" className={forms.label}>{l("kettleLabel")}</label>
            <input id="kettle" name="kettle" type="text" defaultValue={session?.kettle ?? defaults.kettle} className={forms.input} />
          </div>
          <div>
            <label htmlFor="filter" className={forms.label}>{l("filterLabel")}</label>
            <input id="filter" name="filter" type="text" defaultValue={session?.filter ?? defaults.filter} className={forms.input} />
          </div>
          <div>
            <label htmlFor="grinderSetting" className={forms.label}>{l("grinderSettingLabel")}</label>
            <input id="grinderSetting" name="grinderSetting" type="text" defaultValue={session?.grinderSetting ?? ""} className={forms.input} />
          </div>
          <div>
            <label htmlFor="dose" className={forms.label}>{l("doseLabel")}</label>
            <input id="dose" name="dose" type="number" min="0" step="0.1" defaultValue={session?.dose ?? ""} className={forms.input} />
          </div>
          <div>
            <label htmlFor="water" className={forms.label}>{l("waterLabel")}</label>
            <input id="water" name="water" type="number" min="0" step="0.1" defaultValue={session?.water ?? ""} className={forms.input} />
          </div>
          <div>
            <label htmlFor="ratio" className={forms.label}>{l("ratioLabel")}</label>
            <input id="ratio" name="ratio" type="text" defaultValue={session?.ratio ?? defaults.ratio} className={forms.input} />
          </div>
          <div>
            <label htmlFor="temperature" className={forms.label}>{l("temperatureLabel")}</label>
            <input id="temperature" name="temperature" type="number" step="0.1" defaultValue={session?.temperature ?? defaults.temperature} className={forms.input} />
          </div>
          <div>
            <label htmlFor="bloomTime" className={forms.label}>{l("bloomTimeLabel")}</label>
            <input id="bloomTime" name="bloomTime" type="text" defaultValue={session?.bloomTime ?? ""} className={forms.input} />
          </div>
          <div>
            <label htmlFor="brewTime" className={forms.label}>{l("brewTimeLabel")}</label>
            <input id="brewTime" name="brewTime" type="text" defaultValue={session?.brewTime ?? ""} className={forms.input} />
          </div>
          <div>
            <label htmlFor="yieldAmount" className={forms.label}>{l("yieldLabel")}</label>
            <input id="yieldAmount" name="yieldAmount" type="number" min="0" step="0.1" defaultValue={session?.yieldAmount ?? ""} className={forms.input} />
          </div>
          <div>
            <label htmlFor="tds" className={forms.label}>{l("tdsLabel")}</label>
            <input id="tds" name="tds" type="number" min="0" step="0.01" defaultValue={session?.tds ?? ""} className={forms.input} />
          </div>
          <div>
            <label htmlFor="extractionYield" className={forms.label}>{l("extractionYieldLabel")}</label>
            <input id="extractionYield" name="extractionYield" type="number" min="0" step="0.1" defaultValue={session?.extractionYield ?? ""} className={forms.input} />
          </div>
          <div>
            <label htmlFor="rating" className={forms.label}>{l("ratingLabel")}</label>
            <select id="rating" name="rating" defaultValue={session?.rating != null ? String(session.rating) : ""} className={forms.select}>
              <option value="">{l("notSetOption")}</option>
              {RATING_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="tags" className={forms.label}>{l("tagsLabel")}</label>
            <input id="tags" name="tags" type="text" defaultValue={session?.tags.map((tag) => tag.tag).join(", ") ?? ""} placeholder={l("tagsPlaceholder")} className={forms.input} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="notes" className={forms.label}>{l("notesLabel")}</label>
            <textarea id="notes" name="notes" rows={4} defaultValue={session?.notes ?? ""} className={forms.input} />
          </div>
          <div className="sm:col-span-2">
            <label className={forms.checkboxRow}>
              <input type="checkbox" name="favorite" defaultChecked={session?.favorite ?? false} className={forms.checkbox} />
              {l("markFavoriteLabel")}
            </label>
          </div>
        </div>

        <section className="rounded-xl border border-ba-espresso/10 bg-white/30 p-4">
          <h3 className="text-sm font-semibold text-ac-espresso">{l("stepsLabel")}</h3>
          <div className="mt-4 space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-4">
                <input value={step.action} onChange={(e) => setSteps((prev) => prev.map((row, i) => i === index ? { ...row, action: e.target.value } : row))} placeholder={l("stepActionLabel")} className={forms.input} />
                <input value={step.waterAdded} onChange={(e) => setSteps((prev) => prev.map((row, i) => i === index ? { ...row, waterAdded: e.target.value } : row))} placeholder={l("stepWaterLabel")} className={forms.input} />
                <input value={step.duration} onChange={(e) => setSteps((prev) => prev.map((row, i) => i === index ? { ...row, duration: e.target.value } : row))} placeholder={l("stepDurationLabel")} className={forms.input} />
                <input value={step.notes} onChange={(e) => setSteps((prev) => prev.map((row, i) => i === index ? { ...row, notes: e.target.value } : row))} placeholder={l("notesLabel")} className={forms.input} />
              </div>
            ))}
          </div>
          <button type="button" className={`${buttons.secondary} mt-4`} onClick={() => setSteps((prev) => [...prev, { stepNumber: prev.length + 1, action: "", waterAdded: "", duration: "", notes: "" }])}>
            {l("addStepCta")}
          </button>
        </section>

        <section className="rounded-xl border border-ba-espresso/10 bg-white/30 p-4">
          <h3 className="text-sm font-semibold text-ac-espresso">{l("photosLabel")}</h3>
          <div className="mt-4 space-y-3">
            {photos.map((photo, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-2">
                <input value={photo.imageUrl} onChange={(e) => setPhotos((prev) => prev.map((row, i) => i === index ? { ...row, imageUrl: e.target.value } : row))} placeholder={l("photoUrlLabel")} className={forms.input} />
                <input value={photo.caption} onChange={(e) => setPhotos((prev) => prev.map((row, i) => i === index ? { ...row, caption: e.target.value } : row))} placeholder={l("photoCaptionLabel")} className={forms.input} />
              </div>
            ))}
          </div>
          <button type="button" className={`${buttons.secondary} mt-4`} onClick={() => setPhotos((prev) => [...prev, { imageUrl: "", caption: "" }])}>
            {l("addPhotoCta")}
          </button>
        </section>

        <FormMessage error={state?.error} success={state?.success} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" disabled={pending} className={`${buttons.primary} disabled:opacity-70 sm:w-auto`}>
            {pending ? (mode === "create" ? l("savingCta") : l("updatingCta")) : (mode === "create" ? l("saveCta") : l("updateCta"))}
          </button>
          <Link href={mode === "edit" && session ? `/account/brew-sessions/${session.id}` : "/account/brew-sessions"} className={`${buttons.secondary} sm:w-auto`}>
            {l("backToSessions")}
          </Link>
        </div>
      </form>

      {mode === "edit" && session ? (
        <form action={deleteAction} onSubmit={(event) => { if (!window.confirm(l("deleteConfirmTemplate"))) event.preventDefault(); }}>
          <input type="hidden" name="sessionId" value={session.id} />
          <FormMessage error={deleteState?.error} success={deleteState?.success} />
          <button type="submit" disabled={deletePending} className="text-sm font-medium text-red-700 underline-offset-4 hover:underline disabled:opacity-70">
            {deletePending ? l("updatingCta") : l("deleteCta")}
          </button>
        </form>
      ) : null}
    </div>
  );
}

"use client";

import { CONVERTER_DEVICES } from "@/app/components/converter/device-selector";
import { forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { PROCESS_CODES, ROAST_LEVEL_CODES } from "@/types/coach-tools";
import type { CoachToolFieldKey, CoachToolFormValues, CoachToolId, ProcessCode, RoastLevelCode } from "@/types/coach-tools";

/** Which of the shared fields each tool actually needs -- Generate Recipe has no existing numbers to collect, the other two need the full picture. */
const FIELD_SETS: Record<CoachToolId, CoachToolFieldKey[]> = {
  diagnose: ["brewMethod", "device", "origin", "roastLevel", "process", "doseG", "waterG", "temperatureC", "grindSize", "brewTime", "notes"],
  generate: ["brewMethod", "device", "origin", "roastLevel", "process", "doseG", "notes"],
  improve: ["brewMethod", "device", "origin", "roastLevel", "process", "doseG", "waterG", "temperatureC", "grindSize", "brewTime", "notes"],
};

const ROAST_LABEL_KEY: Record<RoastLevelCode, "roastLevelLight" | "roastLevelMedium" | "roastLevelMediumDark" | "roastLevelDark"> = {
  light: "roastLevelLight",
  medium: "roastLevelMedium",
  mediumDark: "roastLevelMediumDark",
  dark: "roastLevelDark",
};

const PROCESS_LABEL_KEY: Record<ProcessCode, "processWashed" | "processNatural" | "processHoney" | "processAnaerobic"> = {
  washed: "processWashed",
  natural: "processNatural",
  honey: "processHoney",
  anaerobic: "processAnaerobic",
};

const NOTES_PLACEHOLDER_KEY: Record<CoachToolId, "notesPlaceholderDiagnose" | "notesPlaceholderGenerate" | "notesPlaceholderImprove"> = {
  diagnose: "notesPlaceholderDiagnose",
  generate: "notesPlaceholderGenerate",
  improve: "notesPlaceholderImprove",
};

type CoachToolFormProps = {
  tool: CoachToolId;
  values: CoachToolFormValues;
  onChange: (values: CoachToolFormValues) => void;
  onSubmit: () => void;
  onReset: () => void;
  submitLabel: string;
  resetLabel: string;
  disabled?: boolean;
};

export function CoachToolForm({ tool, values, onChange, onSubmit, onReset, submitLabel, resetLabel, disabled }: CoachToolFormProps) {
  const { t } = useTranslations();
  const fields = new Set(FIELD_SETS[tool]);

  const set = <K extends keyof CoachToolFormValues>(key: K, value: CoachToolFormValues[K]) => onChange({ ...values, [key]: value });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.has("brewMethod") && (
          <div>
            <label htmlFor={`${tool}-brewMethod`} className={forms.label}>
              {t("coachTools.brewMethodLabel")}
            </label>
            <select
              id={`${tool}-brewMethod`}
              value={values.brewMethod}
              onChange={(event) => set("brewMethod", event.target.value)}
              className={forms.select}
            >
              <option value="" disabled>
                {t("coachTools.brewMethodPlaceholder")}
              </option>
              {CONVERTER_DEVICES.map((device) => (
                <option key={device} value={device}>
                  {device}
                </option>
              ))}
            </select>
          </div>
        )}

        {fields.has("device") && (
          <div>
            <label htmlFor={`${tool}-device`} className={forms.label}>
              {t("coachTools.deviceLabel")}
            </label>
            <input
              id={`${tool}-device`}
              type="text"
              value={values.device}
              onChange={(event) => set("device", event.target.value)}
              placeholder={t("coachTools.devicePlaceholder")}
              className={forms.input}
            />
          </div>
        )}

        {fields.has("origin") && (
          <div>
            <label htmlFor={`${tool}-origin`} className={forms.label}>
              {t("coachTools.originLabel")}
            </label>
            <input
              id={`${tool}-origin`}
              type="text"
              value={values.origin}
              onChange={(event) => set("origin", event.target.value)}
              placeholder={t("coachTools.originPlaceholder")}
              className={forms.input}
            />
          </div>
        )}

        {fields.has("roastLevel") && (
          <div>
            <label htmlFor={`${tool}-roastLevel`} className={forms.label}>
              {t("coachTools.roastLevelLabel")}
            </label>
            <select
              id={`${tool}-roastLevel`}
              value={values.roastLevel}
              onChange={(event) => set("roastLevel", event.target.value as CoachToolFormValues["roastLevel"])}
              className={forms.select}
            >
              <option value="" disabled>
                {t("coachTools.roastLevelPlaceholder")}
              </option>
              {ROAST_LEVEL_CODES.map((code) => (
                <option key={code} value={code}>
                  {t(`coachTools.${ROAST_LABEL_KEY[code]}`)}
                </option>
              ))}
            </select>
          </div>
        )}

        {fields.has("process") && (
          <div>
            <label htmlFor={`${tool}-process`} className={forms.label}>
              {t("coachTools.processLabel")}
            </label>
            <select
              id={`${tool}-process`}
              value={values.process}
              onChange={(event) => set("process", event.target.value as CoachToolFormValues["process"])}
              className={forms.select}
            >
              <option value="" disabled>
                {t("coachTools.processPlaceholder")}
              </option>
              {PROCESS_CODES.map((code) => (
                <option key={code} value={code}>
                  {t(`coachTools.${PROCESS_LABEL_KEY[code]}`)}
                </option>
              ))}
            </select>
          </div>
        )}

        {fields.has("doseG") && (
          <div>
            <label htmlFor={`${tool}-doseG`} className={forms.label}>
              {t("recipeConverter.doseLabel")}
            </label>
            <input
              id={`${tool}-doseG`}
              type="number"
              min={0}
              step="0.1"
              inputMode="decimal"
              value={values.doseG}
              onChange={(event) => set("doseG", event.target.value)}
              placeholder="18"
              className={forms.input}
            />
          </div>
        )}

        {fields.has("waterG") && (
          <div>
            <label htmlFor={`${tool}-waterG`} className={forms.label}>
              {t("recipeConverter.waterLabel")}
            </label>
            <input
              id={`${tool}-waterG`}
              type="number"
              min={0}
              step="1"
              inputMode="decimal"
              value={values.waterG}
              onChange={(event) => set("waterG", event.target.value)}
              placeholder="300"
              className={forms.input}
            />
          </div>
        )}

        {fields.has("temperatureC") && (
          <div>
            <label htmlFor={`${tool}-temperatureC`} className={forms.label}>
              {t("recipeConverter.temperatureLabel")}
            </label>
            <input
              id={`${tool}-temperatureC`}
              type="number"
              min={0}
              step="0.5"
              inputMode="decimal"
              value={values.temperatureC}
              onChange={(event) => set("temperatureC", event.target.value)}
              placeholder="94"
              className={forms.input}
            />
          </div>
        )}

        {fields.has("grindSize") && (
          <div>
            <label htmlFor={`${tool}-grindSize`} className={forms.label}>
              {t("recipeConverter.grindSizeLabel")}
            </label>
            <input
              id={`${tool}-grindSize`}
              type="text"
              value={values.grindSize}
              onChange={(event) => set("grindSize", event.target.value)}
              placeholder="Medium-Fine"
              className={forms.input}
            />
          </div>
        )}

        {fields.has("brewTime") && (
          <div>
            <label htmlFor={`${tool}-brewTime`} className={forms.label}>
              {t("recipeConverter.brewTimeLabel")}
            </label>
            <input
              id={`${tool}-brewTime`}
              type="text"
              value={values.brewTime}
              onChange={(event) => set("brewTime", event.target.value)}
              placeholder="3:00"
              className={forms.input}
            />
          </div>
        )}
      </div>

      {fields.has("notes") && (
        <div>
          <label htmlFor={`${tool}-notes`} className={forms.label}>
            {t("coachTools.notesLabel")}
          </label>
          <textarea
            id={`${tool}-notes`}
            value={values.notes}
            onChange={(event) => set("notes", event.target.value)}
            placeholder={t(`coachTools.${NOTES_PLACEHOLDER_KEY[tool]}`)}
            rows={3}
            className={`${forms.input} resize-none`}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex h-11 items-center justify-center rounded-full bg-amber-600 px-7 text-sm font-medium text-stone-950 transition-all duration-300 ease-out hover:scale-[1.03] hover:bg-amber-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] px-5 text-sm font-medium text-stone-400 transition-colors duration-300 hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-stone-100"
        >
          {resetLabel}
        </button>
      </div>
    </form>
  );
}

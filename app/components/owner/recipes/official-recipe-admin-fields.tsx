import type { RecipeFullDetail } from "@/types/recipe";
import { RECIPE_KINDS, RECIPE_VERIFICATION_STATUSES } from "@/types/official-recipe";

const fieldClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100 outline-none transition-colors placeholder:text-stone-500 focus:border-amber-500/45";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-400";
const textareaClass = `${fieldClass} min-h-[96px] resize-y`;

type OfficialRecipeAdminFieldsProps = {
  initialValues?: RecipeFullDetail | null;
};

export function OfficialRecipeAdminFields({ initialValues }: OfficialRecipeAdminFieldsProps) {
  const faq = initialValues?.faq ?? [];

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-100">Official Recipe Library</h2>
        <p className="mt-1 text-sm text-stone-400">
          Curated editorial content, verification, and version metadata for the official library.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="recipeKind" className={labelClass}>Library type</label>
          <select id="recipeKind" name="recipeKind" defaultValue={initialValues?.recipeKind ?? "official"} className={fieldClass}>
            {RECIPE_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="verificationStatus" className={labelClass}>Verification</label>
          <select
            id="verificationStatus"
            name="verificationStatus"
            defaultValue={initialValues?.verificationStatus ?? "draft"}
            className={fieldClass}
          >
            {RECIPE_VERIFICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="versionLabel" className={labelClass}>Version label</label>
          <input
            id="versionLabel"
            name="versionLabel"
            defaultValue={initialValues?.versionLabel ?? "1.0"}
            className={fieldClass}
            placeholder="1.0"
          />
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label htmlFor="whyItWorks" className={labelClass}>Why this recipe works</label>
          <textarea id="whyItWorks" name="whyItWorks" defaultValue={initialValues?.whyItWorks ?? ""} className={textareaClass} />
        </div>
        <div>
          <label htmlFor="recipeScience" className={labelClass}>Recipe science</label>
          <textarea id="recipeScience" name="recipeScience" defaultValue={initialValues?.recipeScience ?? ""} className={textareaClass} />
        </div>
        <div>
          <label htmlFor="pourStructure" className={labelClass}>Pour structure</label>
          <textarea id="pourStructure" name="pourStructure" defaultValue={initialValues?.pourStructure ?? ""} className={textareaClass} />
        </div>
        <div>
          <label htmlFor="commonMistakes" className={labelClass}>Common mistakes</label>
          <textarea id="commonMistakes" name="commonMistakes" defaultValue={initialValues?.commonMistakes ?? ""} className={textareaClass} />
        </div>
        <div>
          <label htmlFor="adjustments" className={labelClass}>Adjustments</label>
          <textarea id="adjustments" name="adjustments" defaultValue={initialValues?.adjustments ?? ""} className={textareaClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="grinderRecommendation" className={labelClass}>Grinder recommendation</label>
          <input id="grinderRecommendation" name="grinderRecommendation" defaultValue={initialValues?.grinderRecommendation ?? ""} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="waterRecommendation" className={labelClass}>Water recommendation</label>
          <input id="waterRecommendation" name="waterRecommendation" defaultValue={initialValues?.waterRecommendation ?? ""} className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="equipmentNotes" className={labelClass}>Equipment notes</label>
        <textarea id="equipmentNotes" name="equipmentNotes" defaultValue={initialValues?.equipmentNotes ?? ""} className={textareaClass} />
      </div>

      <div>
        <label htmlFor="finishNotes" className={labelClass}>Finish</label>
        <textarea id="finishNotes" name="finishNotes" defaultValue={initialValues?.finishNotes ?? ""} className={textareaClass} />
      </div>

      <input type="hidden" name="faqCount" value={Math.max(faq.length, 3)} />
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-stone-200">FAQ</h3>
        {Array.from({ length: Math.max(faq.length, 3) }).map((_, index) => (
          <div key={index} className="grid gap-3 rounded-xl border border-white/5 p-4">
            <input
              name={`faqQuestion_${index}`}
              defaultValue={faq[index]?.question ?? ""}
              placeholder="Question"
              className={fieldClass}
            />
            <textarea
              name={`faqAnswer_${index}`}
              defaultValue={faq[index]?.answer ?? ""}
              placeholder="Answer"
              className={textareaClass}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="versionChangeReason" className={labelClass}>Version change reason</label>
          <input id="versionChangeReason" name="versionChangeReason" className={fieldClass} placeholder="Why this version was saved" />
        </div>
        <div>
          <label htmlFor="versionBrewingChanges" className={labelClass}>Brewing changes</label>
          <input id="versionBrewingChanges" name="versionBrewingChanges" className={fieldClass} placeholder="What changed in the brew" />
        </div>
      </div>
    </section>
  );
}

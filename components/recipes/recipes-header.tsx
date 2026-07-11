import { Coffee } from "lucide-react";
import { layout, typography } from "@/lib/constants/styles";

export function RecipesHeader() {
  return (
    <header className={`${layout.container} ${layout.introBlock}`}>
      <p className={typography.eyebrow}>Recipe Library</p>
      <h1 className={typography.sectionTitleModern}>
        Specialty Coffee Recipes
      </h1>
      <p className={typography.sectionLead}>
        Browse curated brew guides from top roasters worldwide. Filter by method,
        difficulty, and roast level — search and filtering coming soon.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-stone-400">
        <Coffee className="h-4 w-4 text-amber-500/80" aria-hidden />
        <span>12 recipes available</span>
      </div>
    </header>
  );
}

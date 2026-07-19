import type { LucideIcon } from "lucide-react";
import { Clock, Globe2, Layers3, ShieldCheck, ChefHat } from "lucide-react";
import { GulfHeritageEditorialStatusBadge } from "@/app/components/gulf-heritage/gulf-heritage-editorial-status";
import { ghMotion, ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";
import type { GulfHeritageEditorialStatus } from "@/types/gulf-heritage-editorial";
import { isRecipeVerified } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";

type GhRecipeHeroProps = {
  recipe: GulfHeritageRecipeReference;
  country: string;
  category: string;
  editorialStatus: GulfHeritageEditorialStatus;
  statusLabels: Record<GulfHeritageEditorialStatus | "unverified", string>;
  fieldLabels: {
    difficulty: string;
    preparationTime: string;
    servingSize: string;
  };
};

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ba-espresso/8 bg-ba-sand/40">
        <Icon aria-hidden className="h-4.5 w-4.5 text-ba-bronze" strokeWidth={1.75} />
      </div>
      <div>
        <p className={ghTypography.metaLabel}>{label}</p>
        <p className="mt-1 text-sm font-medium text-ac-espresso">{value}</p>
      </div>
    </div>
  );
}

/** Recipe hero with verification badge and key metadata. */
export function GhRecipeHero({
  recipe,
  country,
  category,
  editorialStatus,
  statusLabels,
  fieldLabels,
}: GhRecipeHeroProps) {
  const verified = isRecipeVerified(recipe);

  return (
    <header className={`${ghSurfaces.cardElevated} ${ghMotion.fadeIn} overflow-hidden`}>
      <div className="border-b border-ba-espresso/6 bg-gradient-to-br from-ba-sand/50 via-ba-pearl to-ba-pearl px-6 py-7 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center gap-2">
          {verified ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/15 bg-emerald-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-900/80">
              <ShieldCheck aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
              {statusLabels.verified}
            </span>
          ) : (
            <GulfHeritageEditorialStatusBadge
              status={recipe.verification.status as GulfHeritageEditorialStatus}
              labels={statusLabels}
            />
          )}
          <GulfHeritageEditorialStatusBadge status={editorialStatus} labels={statusLabels} />
        </div>

        <h3 className="mt-4 font-display text-2xl font-semibold leading-[1.1] tracking-[-0.03em] text-ac-espresso sm:text-[2rem]">
          {recipe.title}
        </h3>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ac-espresso/70">
          <span className="inline-flex items-center gap-1.5">
            <Globe2 aria-hidden className="h-4 w-4 text-ba-bronze/80" strokeWidth={1.75} />
            {country}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Layers3 aria-hidden className="h-4 w-4 text-ba-bronze/80" strokeWidth={1.75} />
            {category}
          </span>
        </div>
      </div>

      {verified && (recipe.difficulty || recipe.preparationTime || recipe.servingSize) ? (
        <div className="grid gap-5 px-6 py-6 sm:grid-cols-3 sm:px-8">
          {recipe.difficulty ? (
            <MetaItem icon={ChefHat} label={fieldLabels.difficulty} value={recipe.difficulty} />
          ) : null}
          {recipe.preparationTime ? (
            <MetaItem icon={Clock} label={fieldLabels.preparationTime} value={recipe.preparationTime} />
          ) : null}
          {recipe.servingSize ? (
            <MetaItem icon={Globe2} label={fieldLabels.servingSize} value={recipe.servingSize} />
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

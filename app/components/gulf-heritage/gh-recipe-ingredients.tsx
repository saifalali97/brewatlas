import { Check } from "lucide-react";
import {
  categorizeRecipeIngredients,
  formatIngredientLine,
} from "@/app/components/gulf-heritage/shared/gh-recipe-utils";
import { ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";
import type { GulfHeritageRecipeIngredient } from "@/types/gulf-heritage-recipe";

type GhRecipeIngredientsProps = {
  title: string;
  ingredients: readonly GulfHeritageRecipeIngredient[];
  labels: {
    main: string;
    optional: string;
    garnishes: string;
    notes: string;
  };
};

function IngredientChecklist({
  heading,
  items,
}: {
  heading: string;
  items: readonly GulfHeritageRecipeIngredient[];
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h5 className={ghTypography.metaLabel}>{heading}</h5>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={`${item.name}-${item.amount}`}
            className={`${ghSurfaces.articlePanelInset} flex items-start gap-3 px-4 py-3`}
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ba-bronze/25 bg-ba-sand/40">
              <Check aria-hidden className="h-3 w-3 text-ba-bronze" strokeWidth={2.5} />
            </span>
            <span className="text-sm leading-relaxed text-ac-espresso">
              {formatIngredientLine(item)}
              {item.notes && !item.notes.toLowerCase().includes("optional") ? (
                <span className="mt-1 block text-xs text-ac-espresso/65">{item.notes}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Checklist-style ingredients with main, optional, garnish, and note groupings. */
export function GhRecipeIngredients({ title, ingredients, labels }: GhRecipeIngredientsProps) {
  if (ingredients.length === 0) return null;

  const { main, optional, garnishes, notes } = categorizeRecipeIngredients(ingredients);

  return (
    <section aria-labelledby="gh-recipe-ingredients-heading">
      <h4 id="gh-recipe-ingredients-heading" className={ghTypography.sectionTitle}>
        {title}
      </h4>
      <div className={`${ghSurfaces.articlePanel} mt-5 space-y-6 px-6 py-6 sm:px-8`}>
        <IngredientChecklist heading={labels.main} items={main} />
        <IngredientChecklist heading={labels.optional} items={optional} />
        <IngredientChecklist heading={labels.garnishes} items={garnishes} />
        {notes.length > 0 ? (
          <div>
            <h5 className={ghTypography.metaLabel}>{labels.notes}</h5>
            <ul className="mt-3 space-y-2">
              {notes.map((note) => (
                <li key={note} className="text-sm leading-relaxed text-ac-espresso/78">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

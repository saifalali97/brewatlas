import { GulfHeritageContentSection } from "@/app/components/gulf-heritage/gulf-heritage-content-section";
import { GulfHeritagePendingContent } from "@/app/components/gulf-heritage/gulf-heritage-pending-content";
import { surfaces } from "@/lib/constants/styles";
import { isRecipeVerified } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";

type GulfHeritageVerifiedRecipesSectionProps = {
  title: string;
  recipes: readonly GulfHeritageRecipeReference[];
  verifiedContentComingSoon: string;
};

/** Verified recipes section — pending/unverified recipes are hidden. */
export function GulfHeritageVerifiedRecipesSection({
  title,
  recipes,
  verifiedContentComingSoon,
}: GulfHeritageVerifiedRecipesSectionProps) {
  const verified = recipes.filter(isRecipeVerified);

  return (
    <GulfHeritageContentSection title={title}>
      {verified.length === 0 ? (
        <GulfHeritagePendingContent message={verifiedContentComingSoon} />
      ) : (
        <ul className={`${surfaces.lightList} divide-y divide-ba-espresso/08`}>
          {verified.map((recipe) => (
            <li key={recipe.slug} className="px-5 py-4 text-sm text-ac-espresso">
              <p className="font-medium">{recipe.title}</p>
            </li>
          ))}
        </ul>
      )}
    </GulfHeritageContentSection>
  );
}

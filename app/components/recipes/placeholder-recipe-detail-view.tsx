import Link from "next/link";
import {
  Coffee,
  Droplets,
  Filter,
  FlaskConical,
  Leaf,
  MapPin,
  Scale,
  Settings2,
  Thermometer,
  Timer,
} from "lucide-react";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import { RecipeEditorialHero, RecipeEditorialSection } from "@/app/components/recipes/recipe-editorial-hero";
import {
  RecipeBrewSpecGrid,
  RecipeFlavorNotesPanel,
  RecipeHeroFactLine,
  RecipePourStepList,
  recipeDetailSectionSpacing,
} from "@/app/components/recipes/recipe-detail-ui";
import { GulfCountryFeaturedRecipes } from "@/app/components/recipes/gulf-country-featured-recipes";
import { PlaceholderRecipeActions } from "@/app/components/recipes/placeholder-recipe-actions";
import { PlaceholderRecipeFlavorWheel } from "@/app/components/recipes/placeholder-recipe-flavor-wheel";
import { PlaceholderRecipeTimeline } from "@/app/components/recipes/placeholder-recipe-timeline";
import {
  gulfCountryPath,
  gulfRecipePath,
  gulfRoasterPath,
} from "@/lib/gulf-directory/countries";
import { findGulfCountryPageRecipe } from "@/lib/gulf-directory/country-page-data";
import type { PlaceholderRecipeDetail } from "@/lib/gulf-directory/placeholder-recipe-detail";
import type { Dictionary } from "@/lib/i18n/types";
import { badges } from "@/lib/constants/styles";
import { rdSurface } from "@/lib/design-system/recipes-directory";

type PlaceholderRecipeDetailViewProps = {
  recipe: PlaceholderRecipeDetail;
  dictionary: Dictionary;
  countryName: string;
  difficultyLabel: string;
  brewMethodLabel: string;
};

/** Premium placeholder recipe detail — reuses BrewAtlas recipe UI primitives. */
export function PlaceholderRecipeDetailView({
  recipe,
  dictionary,
  countryName,
  difficultyLabel,
  brewMethodLabel,
}: PlaceholderRecipeDetailViewProps) {
  const d = dictionary.recipeDetail;
  const page = dictionary.recipesDirectory.recipePage;
  const dir = dictionary.recipesDirectory;

  const similar = recipe.similarSlugs
    .map((slug) => findGulfCountryPageRecipe(slug))
    .filter((item): item is NonNullable<typeof item> => item != null);

  const infoTiles = [
    { icon: Coffee, label: page.beansLabel, value: recipe.coffeeBeans },
    { icon: Leaf, label: d.roastLevelLabel, value: recipe.roastLevel },
    { icon: MapPin, label: page.originLabel, value: recipe.origin },
    { icon: FlaskConical, label: page.processLabel, value: recipe.process },
    { icon: Timer, label: d.roastDateLabel, value: recipe.roastDate },
    { icon: Droplets, label: d.waterLabel, value: recipe.water },
    { icon: Settings2, label: d.grinderLabel, value: recipe.grinder },
    { icon: Coffee, label: page.brewerLabel, value: recipe.brewer },
    { icon: Filter, label: d.filterLabel, value: recipe.filter },
  ];

  const brewSpecs = [
    { icon: Scale, label: d.coffeeDoseLabel, value: recipe.dose },
    { icon: Droplets, label: d.waterLabel, value: recipe.waterAmount },
    { icon: Thermometer, label: d.waterTempLabel, value: recipe.temperature },
    { icon: FlaskConical, label: d.ratioLabel, value: recipe.ratio },
    { icon: Settings2, label: d.grindSizeLabel, value: recipe.grindSize },
    { icon: Timer, label: d.bloomLabel, value: recipe.bloom },
    { icon: Timer, label: page.totalBrewTimeLabel, value: recipe.totalBrewTime },
  ];

  return (
    <div className={`min-h-screen ${rdSurface.page} print:bg-white`}>
      <SectionFrame id="placeholder-recipe-detail" padding="compact" theme="light" wide>
        <RecipeEditorialHero
          backHref={gulfRoasterPath(recipe.countrySlug, recipe.roasterSlug)}
          backLabel={recipe.roasterName}
          imageSrc={recipe.image}
          imageAlt={d.recipeCoverAltTemplate.replace("{title}", recipe.name)}
          eyebrow={brewMethodLabel}
          title={recipe.name}
          lead={recipe.lead}
          badge={
            <span className={badges.tag}>{recipe.isIced ? dir.icedBadge : dir.hotBadge}</span>
          }
          facts={
            <div className="space-y-4">
              <RecipeHeroFactLine
                items={[
                  recipe.roasterName,
                  countryName,
                  brewMethodLabel,
                  difficultyLabel,
                  recipe.brewTime,
                ]}
              />
              <div className="flex flex-wrap items-center gap-4">
                <DifficultyIndicator
                  level={recipe.difficulty}
                  label={difficultyLabel}
                  labelClassName="text-sm text-ac-espresso/70"
                />
                <div className="flex items-center gap-2">
                  <StarRatingDisplay
                    rating={recipe.rating}
                    size="md"
                    label={`${page.ratingLabel}: ${recipe.rating.toFixed(1)}`}
                  />
                  <span className="text-sm tabular-nums text-ac-espresso/65">
                    {recipe.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          }
          actions={
            <PlaceholderRecipeActions
              recipeSlug={recipe.slug}
              recipeName={recipe.name}
              saveLabel={page.saveCta}
              savedLabel={page.savedCta}
              shareLabel={page.shareCta}
              printLabel={page.printCta}
            />
          }
        />

        <div className={recipeDetailSectionSpacing}>
          <RecipeEditorialSection title={page.recipeInfoTitle}>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {infoTiles.map((tile) => (
                <li key={tile.label}>
                  <MetaTile icon={tile.icon} label={tile.label} value={tile.value} />
                </li>
              ))}
            </ul>
          </RecipeEditorialSection>
        </div>

        <div className={recipeDetailSectionSpacing}>
          <RecipeEditorialSection title={page.brewRecipeTitle}>
            <RecipeBrewSpecGrid specs={brewSpecs} ariaLabel={page.brewRecipeTitle} />
          </RecipeEditorialSection>
        </div>

        <div className={recipeDetailSectionSpacing}>
          <RecipeEditorialSection title={page.stepsTitle}>
            <RecipePourStepList
              steps={recipe.steps}
              pourPrefix={d.pourPrefix}
              atTimeLabel={d.atTimeLabel}
            />
          </RecipeEditorialSection>
        </div>

        <div className={`${recipeDetailSectionSpacing} mx-auto max-w-3xl`}>
          <PlaceholderRecipeTimeline title={page.timelineTitle} steps={recipe.steps} />
        </div>

        <div className={`${recipeDetailSectionSpacing} mx-auto max-w-3xl`}>
          <PlaceholderRecipeFlavorWheel
            title={page.flavorWheelTitle}
            profile={recipe.flavorProfile}
            labels={{
              sweetness: d.expectedSweetnessLabel,
              acidity: d.expectedAcidityLabel,
              body: d.expectedBodyLabel,
              bitterness: d.bitternessLabel,
              finish: d.expectedAftertasteLabel,
            }}
          />
          {recipe.flavorTags.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {recipe.flavorTags.map((tag) => (
                <span key={tag} className={badges.tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className={`${recipeDetailSectionSpacing} mx-auto max-w-3xl`}>
          <RecipeFlavorNotesPanel title={page.tastingNotesTitle} notes={recipe.tastingNotes} />
        </div>

        <div className={recipeDetailSectionSpacing}>
          <RecipeEditorialSection title={page.equipmentTitle}>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recipe.equipment.map((item) => (
                <li
                  key={item.name}
                  className="rounded-2xl border border-ba-espresso/[0.08] bg-ba-pearl px-5 py-4"
                >
                  <p className="font-medium text-ac-espresso">{item.name}</p>
                  <p className="mt-1 text-sm text-ac-espresso/65">{item.detail}</p>
                </li>
              ))}
            </ul>
          </RecipeEditorialSection>
        </div>

        {similar.length > 0 ? (
          <div className={`${recipeDetailSectionSpacing} !max-w-none`}>
            <GulfCountryFeaturedRecipes
              title={page.similarTitle}
              description=""
              recipes={similar}
              hotLabel={dir.hotBadge}
              icedLabel={dir.icedBadge}
              difficultyLabels={{
                Beginner: dictionary.homeDifficulty.beginner,
                Intermediate: dictionary.homeDifficulty.intermediate,
                Advanced: dictionary.homeDifficulty.advanced,
              }}
              brewMethodLabels={{
                V60: dictionary.homeFilters.v60,
                Espresso: dictionary.homeFilters.espresso,
                "Cold Brew": dictionary.homeFilters.coldBrew,
                Chemex: dictionary.homeFilters.chemex,
                Aeropress: dictionary.homeFilters.aeropress,
                "Moka Pot": dictionary.homeFilters.mokaPot,
              }}
              imageAltTemplate={dir.countryPage.featuredRecipeImageAltTemplate}
            />
          </div>
        ) : null}

        <p className="mx-auto mt-12 max-w-3xl text-sm text-ac-espresso/50">
          <Link href={gulfCountryPath(recipe.countrySlug)} className="hover:text-ba-bronze">
            {countryName}
          </Link>
          {" · "}
          <Link
            href={gulfRoasterPath(recipe.countrySlug, recipe.roasterSlug)}
            className="hover:text-ba-bronze"
          >
            {recipe.roasterName}
          </Link>
          {" · "}
          <Link href={gulfRecipePath(recipe.slug)} className="hover:text-ba-bronze">
            {recipe.name}
          </Link>
        </p>
      </SectionFrame>
    </div>
  );
}

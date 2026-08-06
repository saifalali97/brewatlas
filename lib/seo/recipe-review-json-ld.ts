import type { RecipeFullDetail } from "@/types/recipe";
import type { RecipeReview } from "@/types/community";
import { parseBrewDurationToIso } from "@/lib/seo/duration";
import { buildBreadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo/json-ld";
import { resolveAbsoluteAssetUrl } from "@/lib/seo/path-utils";
import { getSiteUrl, siteConfig } from "@/lib/seo/site";
import type { Locale } from "@/types/i18n";

function buildRecipeIngredients(recipe: RecipeFullDetail): string[] {
  const items: string[] = [];

  if (recipe.coffeeDose !== null) items.push(`${recipe.coffeeDose}g coffee`);
  if (recipe.waterAmount !== null) items.push(`${recipe.waterAmount}g water`);
  if (recipe.coffeeName) items.push(recipe.coffeeName);
  if (recipe.grindSize) items.push(`${recipe.grindSize} grind`);
  if (recipe.bloomAmount !== null) {
    items.push(`${recipe.bloomAmount}g bloom water${recipe.bloomTime ? ` (${recipe.bloomTime})` : ""}`);
  }
  if (recipe.iceAmount !== null && recipe.iceAmount > 0) items.push(`${recipe.iceAmount}g ice`);
  if (recipe.filterTypeName) items.push(recipe.filterTypeName);

  return items;
}

function buildRecipeInstructions(recipe: RecipeFullDetail): Array<{ "@type": "HowToStep"; text: string }> {
  const steps: Array<{ "@type": "HowToStep"; text: string }> = [];

  for (const pour of recipe.pours) {
    const parts = [`Pour ${pour.pour_number}`];
    if (pour.water_amount !== null) parts.push(`${pour.water_amount}g water`);
    if (pour.time_label) parts.push(`at ${pour.time_label}`);
    if (pour.notes) parts.push(pour.notes);
    steps.push({ "@type": "HowToStep", text: parts.join(" — ") });
  }

  if (recipe.instructions) {
    for (const line of recipe.instructions.split(/\n+/).map((entry) => entry.trim()).filter(Boolean)) {
      steps.push({ "@type": "HowToStep", text: line });
    }
  }

  return steps;
}

function buildRecipeImages(recipe: RecipeFullDetail): string[] {
  const images = new Set<string>();
  if (recipe.coverImageUrl) images.add(resolveAbsoluteAssetUrl(recipe.coverImageUrl));
  for (const image of recipe.images) {
    if (image.url) images.add(resolveAbsoluteAssetUrl(image.url));
  }
  return [...images];
}

function buildRecipeYield(recipe: RecipeFullDetail): string {
  if (recipe.beverageWeight !== null) return `${recipe.beverageWeight}g`;
  return "1 serving";
}

function buildCoreRecipeNode(recipe: RecipeFullDetail, slug: string): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const recipeUrl = `${siteUrl}/recipes/${slug}`;
  const ingredients = buildRecipeIngredients(recipe);
  const instructions = buildRecipeInstructions(recipe);
  const images = buildRecipeImages(recipe);
  const totalTime = parseBrewDurationToIso(recipe.totalBrewTime ?? recipe.estimatedBrewTime);

  const node: Record<string, unknown> = {
    "@type": "Recipe",
    "@id": `${recipeUrl}#recipe`,
    name: recipe.title,
    description: recipe.tastingNotes ?? recipe.description ?? undefined,
    url: recipeUrl,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteUrl,
    },
    recipeCategory: recipe.brewingMethodName ?? undefined,
    recipeCuisine: recipe.originLabel ?? undefined,
    recipeYield: buildRecipeYield(recipe),
  };

  if (images.length > 0) node.image = images.length === 1 ? images[0] : images;
  if (ingredients.length > 0) node.recipeIngredient = ingredients;
  if (instructions.length > 0) node.recipeInstructions = instructions;
  if (totalTime) node.totalTime = totalTime;
  if (recipe.videoUrl) {
    node.video = {
      "@type": "VideoObject",
      name: recipe.title,
      url: recipe.videoUrl,
    };
  }

  return node;
}

export function buildRecipeReviewJsonLd(input: {
  recipe: RecipeFullDetail;
  slug: string;
  summary: { reviewCount: number; averageRating: number | null };
  reviews: RecipeReview[];
  breadcrumbs: BreadcrumbItem[];
  locale?: Locale;
}) {
  const siteUrl = getSiteUrl();
  const recipeUrl = `${siteUrl}/recipes/${input.slug}`;
  const locale = input.locale ?? "en";

  const graph: Record<string, unknown>[] = [buildCoreRecipeNode(input.recipe, input.slug)];

  if (input.summary.reviewCount > 0 && input.summary.averageRating !== null) {
    (graph[0] as Record<string, unknown>).aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.summary.averageRating,
      reviewCount: input.summary.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  for (const review of input.reviews.slice(0, 10)) {
    if (!review.reviewText) continue;
    graph.push({
      "@type": "Review",
      itemReviewed: { "@id": `${recipeUrl}#recipe` },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        "@type": "Person",
        name: review.user.displayName ?? "BrewAtlas Member",
      },
      reviewBody: review.reviewText,
      datePublished: review.createdAt,
    });
  }

  graph.push(buildBreadcrumbJsonLd(input.breadcrumbs, locale));

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

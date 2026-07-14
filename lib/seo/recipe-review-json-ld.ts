import type { RecipeFullDetail } from "@/types/recipe";
import type { RecipeReview } from "@/types/community";
import { getSiteUrl } from "@/lib/seo/site";

export function buildRecipeReviewJsonLd(input: {
  recipe: RecipeFullDetail;
  slug: string;
  summary: { reviewCount: number; averageRating: number | null };
  reviews: RecipeReview[];
}) {
  const siteUrl = getSiteUrl();
  const recipeUrl = `${siteUrl}/recipes/${input.slug}`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Recipe",
      "@id": `${recipeUrl}#recipe`,
      name: input.recipe.title,
      description: input.recipe.tastingNotes ?? input.recipe.description ?? undefined,
      image: input.recipe.coverImageUrl ?? undefined,
      url: recipeUrl,
    },
  ];

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

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

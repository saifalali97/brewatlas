import dynamic from "next/dynamic";

export const FeaturedCoverSection = dynamic(() =>
  import("@/app/components/sections/featured-recipes-section").then(
    (mod) => mod.FeaturedCoverSection,
  ),
);

export const FeaturedTableSection = dynamic(() =>
  import("@/app/components/sections/featured-recipes-section").then(
    (mod) => mod.FeaturedTableSection,
  ),
);

/** @deprecated Use FeaturedCoverSection + FeaturedTableSection */
export const FeaturedRecipesSection = dynamic(() =>
  import("@/app/components/sections/featured-recipes-section").then(
    (mod) => mod.FeaturedRecipesSection,
  ),
);

export const BrewingMethodsSection = dynamic(() =>
  import("@/app/components/sections/brewing-methods-section").then(
    (mod) => mod.BrewingMethodsSection,
  ),
);

export const CoffeeOriginsSection = dynamic(() =>
  import("@/app/components/sections/coffee-origins-section").then(
    (mod) => mod.CoffeeOriginsSection,
  ),
);

export const TopRoastersSection = dynamic(() =>
  import("@/app/components/sections/top-roasters-section").then(
    (mod) => mod.TopRoastersSection,
  ),
);

export const FeatureSpotlightSection = dynamic(() =>
  import("@/app/components/sections/feature-spotlight-section").then(
    (mod) => mod.FeatureSpotlightSection,
  ),
);

export const TestimonialsSection = dynamic(() =>
  import("@/app/components/sections/testimonials-section").then(
    (mod) => mod.TestimonialsSection,
  ),
);

export const PricingSection = dynamic(() =>
  import("@/app/components/sections/pricing-section").then((mod) => mod.PricingSection),
);

export const FaqSection = dynamic(() =>
  import("@/app/components/sections/faq-section").then((mod) => mod.FaqSection),
);

export const SiteFooter = dynamic(() =>
  import("@/app/components/layout/site-footer").then((mod) => mod.SiteFooter),
);

export const RecipeReviewsPanel = dynamic(() =>
  import("@/app/components/reviews/recipe-reviews-panel").then((mod) => mod.RecipeReviewsPanel),
);

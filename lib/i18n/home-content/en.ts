import type { HomeContent } from "@/types/homepage";
import {
  brewMethods,
  coffeeOrigins,
  faqs,
  featuredRecipes,
  heroImage,
  pricingPlans,
  testimonials,
  topRoasters,
} from "@/data/homepage";

/**
 * English (default) homepage content. Re-exports `data/homepage.ts`
 * directly -- that file stays the single source of truth for the English
 * copy (it's also used, unchanged, by `/methods`, `/origins`, `/roasters`,
 * and `/premium`). See `lib/i18n/home-content/ar.ts` for the Arabic
 * counterpart and `lib/i18n/get-home-content.ts` for the locale loader.
 */
const en: HomeContent = {
  heroImage,
  featuredRecipes,
  brewMethods,
  coffeeOrigins,
  topRoasters,
  testimonials,
  pricingPlans,
  faqs,
};

export default en;

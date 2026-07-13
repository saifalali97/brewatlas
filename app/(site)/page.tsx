import { HeroSection } from "@/app/components/sections/hero-section";
import {
  BrewingMethodsSection,
  CoffeeOriginsSection,
  FaqSection,
  FeaturedRecipesSection,
  PricingSection,
  TestimonialsSection,
  TopRoastersSection,
} from "@/lib/dynamic-sections";
import { buttons } from "@/lib/constants/styles";
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

export default function Home() {
  return (
    <>
      <HeroSection
        heroImage={heroImage}
        btnPrimary={buttons.primary}
        btnSecondary={buttons.secondary}
      />
      <FeaturedRecipesSection
        recipes={featuredRecipes}
        btnSecondary={buttons.secondary}
      />
      <BrewingMethodsSection methods={brewMethods} />
      <CoffeeOriginsSection origins={coffeeOrigins} />
      <TopRoastersSection roasters={topRoasters} />
      <TestimonialsSection testimonials={testimonials} />
      <PricingSection plans={pricingPlans} />
      <FaqSection faqs={faqs} />
    </>
  );
}

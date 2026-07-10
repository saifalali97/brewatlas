import { SiteFooter } from "@/app/components/layout/site-footer";
import { SiteNav } from "@/app/components/layout/site-nav";
import { FloatingActions } from "@/app/components/layout/floating-actions";
import { BrewingMethodsSection } from "@/app/components/sections/brewing-methods-section";
import { CoffeeOriginsSection } from "@/app/components/sections/coffee-origins-section";
import { FaqSection } from "@/app/components/sections/faq-section";
import { FeaturedRecipesSection } from "@/app/components/sections/featured-recipes-section";
import { HeroSection } from "@/app/components/sections/hero-section";
import { PricingSection } from "@/app/components/sections/pricing-section";
import { TestimonialsSection } from "@/app/components/sections/testimonials-section";
import { TopRoastersSection } from "@/app/components/sections/top-roasters-section";
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
    <div className="relative min-h-screen overflow-hidden bg-[#0a0705] font-sans text-stone-100">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(180,120,60,0.35),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_20%,rgba(120,70,40,0.2),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_10%_80%,rgba(90,50,30,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_50%_50%,rgba(180,120,60,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(217,119,6,0.04),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_65%,rgba(120,70,40,0.05),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(90,50,30,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(217,119,6,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f0a]/40 via-transparent to-[#0a0705]" />
      </div>

      <SiteNav />

      <main>
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
      </main>

      <FloatingActions />
      <SiteFooter />
    </div>
  );
}

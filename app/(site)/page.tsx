import { Coffee, Cpu, Landmark, Sparkles } from "lucide-react";
import { HeroSection } from "@/app/components/sections/hero-section";
import {
  BrewingMethodsSection,
  CoffeeOriginsSection,
  FaqSection,
  FeatureSpotlightSection,
  FeaturedRecipesSection,
  PricingSection,
  TestimonialsSection,
  TopRoastersSection,
} from "@/lib/dynamic-sections";
import { buttons } from "@/lib/constants/styles";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { getLocale } from "@/lib/i18n/locale";

export default async function Home() {
  const locale = await getLocale();
  const [dictionary, content] = await Promise.all([getDictionary(locale), getHomeContent(locale)]);

  const {
    heroImage,
    featuredRecipes,
    brewMethods,
    coffeeOrigins,
    topRoasters,
    testimonials,
    pricingPlans,
    faqs,
  } = content;

  return (
    <>
      <HeroSection
        heroImage={heroImage}
        btnPrimary={buttons.primary}
        btnSecondary={buttons.secondary}
      />
      <FeaturedRecipesSection recipes={featuredRecipes} btnSecondary={buttons.secondary} />
      <FeatureSpotlightSection
        id="ai-coach"
        icon={Sparkles}
        eyebrow={dictionary.homeAiCoach.eyebrow}
        title={dictionary.homeAiCoach.title}
        description={dictionary.homeAiCoach.description}
        highlights={[
          dictionary.homeAiCoach.highlight1,
          dictionary.homeAiCoach.highlight2,
          dictionary.homeAiCoach.highlight3,
        ]}
        ctaLabel={dictionary.homeAiCoach.cta}
        ctaHref="/coach"
        className=""
      />
      <BrewingMethodsSection
        methods={brewMethods}
        eyebrow={dictionary.homeBrewingMethods.eyebrow}
        title={dictionary.homeBrewingMethods.title}
        description={dictionary.homeBrewingMethods.description}
        cardLabels={{
          brewTime: dictionary.homeBrewingMethods.brewTimeLabel,
          difficulty: dictionary.homeBrewingMethods.difficultyLabel,
          cupProfile: dictionary.homeBrewingMethods.cupProfileLabel,
          body: dictionary.homeBrewingMethods.bodyLabel,
          acidity: dictionary.homeBrewingMethods.acidityLabel,
          sweetness: dictionary.homeBrewingMethods.sweetnessLabel,
          bestWith: dictionary.homeBrewingMethods.bestWithPrefix,
          learnMethod: dictionary.homeBrewingMethods.learnMethod,
          imageAltTemplate: dictionary.homeBrewingMethods.imageAltTemplate,
          difficultyLabels: {
            Beginner: dictionary.homeDifficulty.beginner,
            Intermediate: dictionary.homeDifficulty.intermediate,
            Advanced: dictionary.homeDifficulty.advanced,
          },
        }}
      />
      <FeatureSpotlightSection
        id="xbloom"
        icon={Cpu}
        eyebrow={dictionary.homeXbloom.eyebrow}
        title={dictionary.homeXbloom.title}
        description={dictionary.homeXbloom.description}
        highlights={[
          dictionary.homeXbloom.highlight1,
          dictionary.homeXbloom.highlight2,
          dictionary.homeXbloom.highlight3,
        ]}
        ctaLabel={dictionary.homeXbloom.cta}
        ctaHref="/devices/xbloom"
        className=""
      />
      <CoffeeOriginsSection
        origins={coffeeOrigins}
        eyebrow={dictionary.homeCoffeeOrigins.eyebrow}
        title={dictionary.homeCoffeeOrigins.title}
        description={dictionary.homeCoffeeOrigins.description}
        cardLabels={{
          premium: dictionary.common.premiumBadge,
          altitude: dictionary.homeCoffeeOrigins.altitudeLabel,
          process: dictionary.homeCoffeeOrigins.processLabel,
          roast: dictionary.homeCoffeeOrigins.roastLabel,
          brewMethod: dictionary.homeCoffeeOrigins.brewMethodLabel,
          exploreOrigin: dictionary.homeCoffeeOrigins.exploreOrigin,
          imageAltTemplate: dictionary.homeCoffeeOrigins.imageAltTemplate,
        }}
      />
      <TopRoastersSection
        roasters={topRoasters}
        eyebrow={dictionary.homeTopRoasters.eyebrow}
        title={dictionary.homeTopRoasters.title}
        description={dictionary.homeTopRoasters.description}
        cardLabels={{
          premium: dictionary.common.premiumBadge,
          country: dictionary.homeTopRoasters.countryLabel,
          founded: dictionary.homeTopRoasters.foundedLabel,
          recipes: dictionary.homeTopRoasters.recipesCountLabel,
          rating: dictionary.homeTopRoasters.ratingLabel,
          viewRoaster: dictionary.homeTopRoasters.viewRoaster,
          imageAltTemplate: dictionary.homeTopRoasters.imageAltTemplate,
        }}
      />
      <TestimonialsSection
        testimonials={testimonials}
        eyebrow={dictionary.homeTestimonials.eyebrow}
        title={dictionary.homeTestimonials.title}
        imageAltTemplate={dictionary.homeTestimonials.imageAltTemplate}
      />
      <FeatureSpotlightSection
        id="arabic-coffee"
        icon={Coffee}
        eyebrow={dictionary.homeArabicCoffee.eyebrow}
        title={dictionary.homeArabicCoffee.title}
        description={dictionary.homeArabicCoffee.description}
        highlights={[
          dictionary.homeArabicCoffee.highlight1,
          dictionary.homeArabicCoffee.highlight2,
          dictionary.homeArabicCoffee.highlight3,
        ]}
        ctaLabel={dictionary.homeArabicCoffee.cta}
        ctaHref="/culture/arabic-coffee"
      />
      <FeatureSpotlightSection
        id="uae-coffee-culture"
        icon={Landmark}
        eyebrow={dictionary.homeUaeCoffeeCulture.eyebrow}
        title={dictionary.homeUaeCoffeeCulture.title}
        description={dictionary.homeUaeCoffeeCulture.description}
        highlights={[
          dictionary.homeUaeCoffeeCulture.highlight1,
          dictionary.homeUaeCoffeeCulture.highlight2,
          dictionary.homeUaeCoffeeCulture.highlight3,
        ]}
        ctaLabel={dictionary.homeUaeCoffeeCulture.cta}
        ctaHref="/culture/uae-coffee-culture"
        className=""
      />
      <PricingSection
        plans={pricingPlans}
        eyebrow={dictionary.homePricing.eyebrow}
        title={dictionary.homePricing.title}
        description={dictionary.homePricing.description}
        cardLabels={{
          mostPopular: dictionary.homePricing.mostPopular,
          recipes: dictionary.homePricing.recipesLabel,
          access: dictionary.homePricing.accessLabel,
          offlineAccess: dictionary.homePricing.offlineAccessLabel,
          favorites: dictionary.homePricing.favoritesLabel,
          aiRecommendations: dictionary.homePricing.aiRecommendationsLabel,
          brewTracking: dictionary.homePricing.brewTrackingLabel,
          prioritySupport: dictionary.homePricing.prioritySupportLabel,
        }}
      />
      <FaqSection
        faqs={faqs}
        eyebrow={dictionary.homeFaq.eyebrow}
        title={dictionary.homeFaq.title}
        description={dictionary.homeFaq.description}
        supportCardTitle={dictionary.homeFaq.supportCardTitle}
        supportCardBody={dictionary.homeFaq.supportCardBody}
        contactSupport={dictionary.homeFaq.contactSupport}
      />
    </>
  );
}

import type { Metadata } from "next";
import { PricingCard } from "@/app/components/cards/pricing-card";
import { FaqAccordion } from "@/app/components/ui/faq-accordion";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { typography } from "@/lib/constants/styles";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/premium",
    locale,
    title: dictionary.metadata.premiumTitle,
    description: dictionary.metadata.premiumDescription,
  });
}

// Pricing plans are index-identical across every locale's `HomeContent`
// (see `lib/i18n/home-content/*`) -- `plan.name` itself is translated, so
// the CTA destination is keyed by position (Free, Premium, Team), not by
// the (locale-dependent) plan name.
const ctaHrefByPlanIndex = ["/login", "/login", "/contact"];

export default async function PremiumPage() {
  const locale = await getLocale();
  const [dictionary, content] = await Promise.all([getDictionary(locale), getHomeContent(locale)]);

  return (
    <>
      <SectionFrame id="premium-plans" ariaLabelledBy="premium-plans-heading" padding="compact">
        <PageHeader
          eyebrow={dictionary.homePricing.eyebrow}
          title={dictionary.homePricing.title}
          description={dictionary.homePricing.description}
        />

        <div className="grid items-stretch gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
          {content.pricingPlans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              ctaHref={ctaHrefByPlanIndex[index] ?? "/login"}
              labels={{
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
          ))}
        </div>
      </SectionFrame>

      <SectionFrame id="premium-faq" ariaLabelledBy="premium-faq-heading" padding="compact" className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-2xl text-center">
          <p className={typography.eyebrow}>{dictionary.homeFaq.eyebrow}</p>
          <h2 id="premium-faq-heading" className={typography.sectionTitleModern}>
            {dictionary.homePricing.membershipQuestionsTitle}
          </h2>
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <FaqAccordion faqs={content.faqs} headingId="premium-faq-heading" />
        </div>
      </SectionFrame>
    </>
  );
}

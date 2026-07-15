import type { Metadata } from "next";
import { PremiumPricingSection } from "@/app/components/subscription/premium-pricing-section";
import { isStripeBillingEnabled } from "@/lib/billing/billing-adapter";
import { getMembershipSummary } from "@/lib/data/membership";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

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

export default async function PremiumPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const [dictionary, content, membership] = await Promise.all([
    getDictionary(locale),
    getHomeContent(locale),
    data.user ? getMembershipSummary(supabase, data.user.id) : Promise.resolve(null),
  ]);

  return (
    <PremiumPricingSection
      dictionary={dictionary}
      content={content}
      membership={membership}
      stripeEnabled={isStripeBillingEnabled()}
      isAuthenticated={Boolean(data.user)}
    />
  );
}

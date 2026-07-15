import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SubscriptionPanel } from "@/app/components/subscription/subscription-panel";
import { isStripeBillingEnabled } from "@/lib/billing/billing-adapter";
import { getMembershipSummary } from "@/lib/data/membership";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ checkout?: string; error?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/subscription",
    locale,
    title: dictionary.metadata.subscriptionTitle,
    description: dictionary.metadata.subscriptionDescription,
    noIndex: true,
  });
}

function resolveFeedback(
  checkout: string | undefined,
  error: string | undefined,
  dictionary: Awaited<ReturnType<typeof getDictionary>>,
): { success: string | null; error: string | null } {
  const labels = dictionary.subscriptionPage;
  if (checkout === "success") return { success: labels.checkoutSuccessMessage, error: null };
  if (checkout === "canceled") return { success: null, error: labels.checkoutCanceledMessage };

  switch (error) {
    case "already_subscribed":
      return { success: null, error: labels.alreadySubscribedError };
    case "billing_not_configured":
      return { success: null, error: labels.billingNotConfiguredError };
    case "no_billing_account":
      return { success: null, error: labels.noBillingAccountError };
    default:
      return { success: null, error: null };
  }
}

export default async function AccountSubscriptionPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/account/subscription");
  }

  const membership = await getMembershipSummary(supabase, data.user.id);
  const feedback = resolveFeedback(resolvedSearchParams.checkout, resolvedSearchParams.error, dictionary);

  return (
    <SectionFrame id="account-subscription" ariaLabelledBy="account-subscription-heading" padding="compact">
      <Link
        href="/account"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-400 transition-colors duration-300 hover:text-amber-400/90"
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        {dictionary.subscriptionPage.backToAccount}
      </Link>

      <PageHeader
        eyebrow={dictionary.subscriptionPage.eyebrow}
        title={dictionary.subscriptionPage.title}
        description={dictionary.subscriptionPage.description}
        centered={false}
      />

      <SubscriptionPanel
        membership={membership}
        dictionary={dictionary}
        stripeEnabled={isStripeBillingEnabled()}
        checkoutMessage={feedback.success}
        errorMessage={feedback.error}
        locale={locale}
      />
    </SectionFrame>
  );
}

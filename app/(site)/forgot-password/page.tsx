import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/app/components/ui/page-header";
import { PageEditorialPhoto } from "@/app/components/ui/page-editorial-photo";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { PAGE_EDITORIAL_IMAGES } from "@/lib/media/page-images";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { ForgotPasswordForm } from "./forgot-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/forgot-password",
    locale,
    title: dictionary.metadata.forgotPasswordTitle,
    description: dictionary.metadata.forgotPasswordDescription,
    noIndex: true,
  });
}

export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <SectionFrame id="forgot-password-page" ariaLabelledBy="forgot-password-page-heading" padding="compact" className="max-lg:!py-12">
      <PageEditorialPhoto src={PAGE_EDITORIAL_IMAGES.authRecovery} alt="" variant="compact" />
      <PageHeader headingId="forgot-password-page-heading"
        eyebrow={dictionary.auth.accountRecoveryEyebrow}
        title={dictionary.auth.forgotPasswordTitle}
        description={dictionary.auth.forgotPasswordDescription}
      />

      <SurfaceCard>
        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-ac-espresso">
          {dictionary.auth.rememberYourPassword}{" "}
          <Link href="/login" className="text-ac-espresso underline-offset-4 hover:text-ba-bronze hover:underline">
            {dictionary.auth.login}
          </Link>
        </p>
      </SurfaceCard>
    </SectionFrame>
  );
}

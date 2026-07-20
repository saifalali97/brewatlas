import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { PageEditorialPhoto } from "@/app/components/ui/page-editorial-photo";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { PAGE_EDITORIAL_IMAGES } from "@/lib/media/page-images";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/reset-password",
    locale,
    title: dictionary.metadata.resetPasswordTitle,
    description: dictionary.metadata.resetPasswordDescription,
    noIndex: true,
  });
}

export default async function ResetPasswordPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  // Only reachable with a valid (recovery) session, established by
  // /auth/callback after the user clicks the emailed reset link.
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/forgot-password");
  }

  return (
    <SectionFrame id="reset-password-page" ariaLabelledBy="reset-password-page-heading" padding="compact">
      <PageEditorialPhoto src={PAGE_EDITORIAL_IMAGES.authRecovery} alt="" />
      <PageHeader headingId="reset-password-page-heading"
        eyebrow={dictionary.auth.accountRecoveryEyebrow}
        title={dictionary.auth.resetPasswordTitle}
        description={dictionary.auth.resetPasswordDescription}
      />

      <SurfaceCard>
        <ResetPasswordForm />
      </SurfaceCard>
    </SectionFrame>
  );
}

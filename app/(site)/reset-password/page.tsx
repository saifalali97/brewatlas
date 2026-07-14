import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
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
      <PageHeader
        eyebrow={dictionary.auth.accountRecoveryEyebrow}
        title={dictionary.auth.resetPasswordTitle}
        description={dictionary.auth.resetPasswordDescription}
      />

      <div className="mx-auto max-w-md rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <ResetPasswordForm />
      </div>
    </SectionFrame>
  );
}

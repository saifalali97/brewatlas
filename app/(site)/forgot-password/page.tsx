import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
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
    <SectionFrame id="forgot-password-page" ariaLabelledBy="forgot-password-page-heading" padding="compact">
<PageHeader headingId="forgot-password-page-heading"
        eyebrow={dictionary.auth.accountRecoveryEyebrow}
        title={dictionary.auth.forgotPasswordTitle}
        description={dictionary.auth.forgotPasswordDescription}
      />

      <div className="mx-auto max-w-md rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-stone-500">
          {dictionary.auth.rememberYourPassword}{" "}
          <Link href="/login" className="text-amber-400/90 underline-offset-4 hover:underline">
            {dictionary.auth.login}
          </Link>
        </p>
      </div>
    </SectionFrame>
  );
}

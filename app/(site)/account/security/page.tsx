import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "./change-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/security",
    locale,
    title: dictionary.metadata.securityTitle,
    description: dictionary.metadata.securityDescription,
    noIndex: true,
  });
}

export default async function AccountSecurityPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.securityPage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/account/security");
  }

  return (
    <SectionFrame id="account-security-page" ariaLabelledBy="account-security-heading" padding="compact">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          headingId="account-security-heading"
          eyebrow={labels.eyebrow}
          title={labels.title}
          description={labels.description}
          centered={false}
        />
        <Link
          href="/account"
          className={`${acTypography.nav} inline-flex h-10 items-center px-4 text-ac-espresso hover:text-ba-bronze ${acFocus.ring}`}
        >
          {labels.backToAccount}
        </Link>
      </div>

      <div className="max-w-xl rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <h2 className={acTypography.h3}>{labels.changePasswordHeading}</h2>
        <p className={`${acTypography.body} mt-2 text-ac-espresso/75`}>{labels.changePasswordDescription}</p>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </div>
    </SectionFrame>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { OAuthButtons } from "@/app/components/auth/oauth-buttons";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { SignupForm } from "./signup-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/signup",
    locale,
    title: dictionary.metadata.signupTitle,
    description: dictionary.metadata.signupDescription,
    noIndex: true,
  });
}

export default async function SignupPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <SectionFrame id="signup-page" ariaLabelledBy="signup-page-heading" padding="compact">
      <PageHeader eyebrow={dictionary.auth.joinBrewAtlasEyebrow} title={dictionary.auth.createYourAccountTitle} />

      <div className="mx-auto max-w-md rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <SignupForm />

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-xs tracking-[0.08em] text-stone-500 uppercase">{dictionary.auth.orDivider}</span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <OAuthButtons />

        <p className="mt-6 text-center text-sm text-stone-500">
          {dictionary.auth.haveAccount}{" "}
          <Link href="/login" className="text-amber-400/90 underline-offset-4 hover:underline">
            {dictionary.auth.login}
          </Link>
        </p>
      </div>
    </SectionFrame>
  );
}

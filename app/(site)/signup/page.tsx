import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/app/components/ui/page-header";
import { PageEditorialPhoto } from "@/app/components/ui/page-editorial-photo";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { OAuthButtons } from "@/app/components/auth/oauth-buttons";
import { PAGE_EDITORIAL_IMAGES } from "@/lib/media/page-images";
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
    <SectionFrame id="signup-page" ariaLabelledBy="signup-page-heading" padding="compact" className="max-lg:!py-12">
      <PageEditorialPhoto src={PAGE_EDITORIAL_IMAGES.authSignup} alt="" priority variant="compact" />
      <PageHeader headingId="signup-page-heading" eyebrow={dictionary.auth.joinBrewAtlasEyebrow} title={dictionary.auth.createYourAccountTitle} />

      <SurfaceCard>
        <SignupForm />

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-ba-espresso/[0.08]" />
          <span className="text-xs tracking-[0.08em] text-ac-espresso uppercase">{dictionary.auth.orDivider}</span>
          <div className="h-px flex-1 bg-ba-espresso/[0.08]" />
        </div>

        <OAuthButtons />

        <p className="mt-6 text-center text-sm text-ac-espresso">
          {dictionary.auth.haveAccount}{" "}
          <Link href="/login" className="text-ac-espresso underline-offset-4 hover:text-ba-bronze hover:underline">
            {dictionary.auth.login}
          </Link>
        </p>
      </SurfaceCard>
    </SectionFrame>
  );
}

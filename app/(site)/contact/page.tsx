import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { PageEditorialPhoto } from "@/app/components/ui/page-editorial-photo";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { PAGE_EDITORIAL_IMAGES } from "@/lib/media/page-images";
import { acSurface, acTypography } from "@/lib/design-system/atlas-canon";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { ContactForm } from "./contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/contact",
    locale,
    title: dictionary.metadata.contactTitle,
    description: dictionary.metadata.contactDescription,
  });
}

export default async function ContactPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const c = dictionary.contactPage;

  return (
    <SectionFrame id="contact-page" ariaLabelledBy="contact-page-heading" padding="compact">
      <PageEditorialPhoto src={PAGE_EDITORIAL_IMAGES.contact} alt={c.title} />
      <PageHeader
        headingId="contact-page-heading"
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.description}
      />

      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-2 lg:items-start">
        <div className={`${acSurface.plate} p-6 sm:p-8`}>
          <p className={acTypography.h3}>{c.supportCardTitle}</p>
          <p className={`${acTypography.body} mt-4`}>{c.supportCardBody}</p>
          <div className="ac-folio-divider mt-8 flex items-center gap-2.5 pt-6 text-sm text-ac-espresso">
            <Mail className="h-4 w-4 text-ac-espresso" aria-hidden />
            support@brewatlas.app
          </div>
        </div>

        <ContactForm />
      </div>
    </SectionFrame>
  );
}

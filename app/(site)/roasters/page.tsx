import type { Metadata } from "next";
import { RoasterCard } from "@/app/components/cards/roaster-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/roasters",
    locale,
    title: dictionary.metadata.roastersTitle,
    description: dictionary.metadata.roastersDescription,
  });
}

export default async function RoastersPage() {
  const locale = await getLocale();
  const [dictionary, content] = await Promise.all([getDictionary(locale), getHomeContent(locale)]);

  return (
    <SectionFrame id="roasters-listing" ariaLabelledBy="roasters-listing-heading" padding="compact">
<PageHeader headingId="roasters-listing-heading"
        eyebrow={dictionary.homeTopRoasters.eyebrow}
        title={dictionary.homeTopRoasters.title}
        description={dictionary.homeTopRoasters.description}
      />

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {content.topRoasters.map((roaster) => (
          <RoasterCard
            key={roaster.name}
            roaster={roaster}
            ctaHref="/recipes"
            labels={{
              premium: dictionary.common.premiumBadge,
              country: dictionary.homeTopRoasters.countryLabel,
              founded: dictionary.homeTopRoasters.foundedLabel,
              recipes: dictionary.homeTopRoasters.recipesCountLabel,
              rating: dictionary.homeTopRoasters.ratingLabel,
              viewRoaster: dictionary.homeTopRoasters.viewRoaster,
              imageAltTemplate: dictionary.homeTopRoasters.imageAltTemplate,
            }}
          />
        ))}
      </div>
    </SectionFrame>
  );
}

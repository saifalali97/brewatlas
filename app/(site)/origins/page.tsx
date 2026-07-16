import type { Metadata } from "next";
import { OriginCard } from "@/app/components/cards/origin-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata, localizedPathUrl } from "@/lib/seo/localized-metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/origins",
    locale,
    title: dictionary.metadata.originsTitle,
    description: dictionary.metadata.originsDescription,
  });
}

export default async function OriginsPage() {
  const locale = await getLocale();
  const [dictionary, content] = await Promise.all([getDictionary(locale), getHomeContent(locale)]);

  return (
    <SectionFrame id="origins-listing" ariaLabelledBy="origins-listing-heading" padding="compact">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageJsonLd({
              url: localizedPathUrl("/origins", locale),
              name: dictionary.homeCoffeeOrigins.title,
              description: dictionary.homeCoffeeOrigins.description,
              itemCount: content.coffeeOrigins.length,
            }),
          ),
        }}
      />
      <PageHeader headingId="origins-listing-heading"
        eyebrow={dictionary.homeCoffeeOrigins.eyebrow}
        title={dictionary.homeCoffeeOrigins.title}
        description={dictionary.homeCoffeeOrigins.description}
      />

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {content.coffeeOrigins.map((origin) => (
          <OriginCard
            key={origin.country}
            origin={origin}
            ctaHref="/recipes"
            labels={{
              premium: dictionary.common.premiumBadge,
              altitude: dictionary.homeCoffeeOrigins.altitudeLabel,
              process: dictionary.homeCoffeeOrigins.processLabel,
              roast: dictionary.homeCoffeeOrigins.roastLabel,
              brewMethod: dictionary.homeCoffeeOrigins.brewMethodLabel,
              exploreOrigin: dictionary.homeCoffeeOrigins.exploreOrigin,
              imageAltTemplate: dictionary.homeCoffeeOrigins.imageAltTemplate,
            }}
          />
        ))}
      </div>
    </SectionFrame>
  );
}

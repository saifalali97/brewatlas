import type { Metadata } from "next";
import { Chapter } from "@/app/components/atlas/chapter";
import { OriginsAtlasExplorer } from "@/app/components/origins/origins-atlas-explorer";
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
    <Chapter id="origins-atlas" rhythm="sand" padding="standard" wide ariaLabelledBy="origins-atlas-heading">
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
      <OriginsAtlasExplorer
        origins={content.coffeeOrigins}
        eyebrow={dictionary.homeCoffeeOrigins.eyebrow}
        title={dictionary.homeCoffeeOrigins.title}
        description={dictionary.homeCoffeeOrigins.description}
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
    </Chapter>
  );
}

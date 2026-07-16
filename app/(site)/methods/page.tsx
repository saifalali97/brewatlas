import type { Metadata } from "next";
import { Folio, FolioItem } from "@/app/components/atlas/folio";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { interpolate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata, localizedPathUrl } from "@/lib/seo/localized-metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/methods",
    locale,
    title: dictionary.metadata.methodsTitle,
    description: dictionary.metadata.methodsDescription,
  });
}

export default async function MethodsPage() {
  const locale = await getLocale();
  const [dictionary, content] = await Promise.all([getDictionary(locale), getHomeContent(locale)]);

  const difficultyLabels = {
    Beginner: dictionary.homeDifficulty.beginner,
    Intermediate: dictionary.homeDifficulty.intermediate,
    Advanced: dictionary.homeDifficulty.advanced,
  };

  return (
    <SectionFrame id="methods-listing" ariaLabelledBy="methods-listing-heading" padding="compact">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageJsonLd({
              url: localizedPathUrl("/methods", locale),
              name: dictionary.homeBrewingMethods.title,
              description: dictionary.homeBrewingMethods.description,
              itemCount: content.brewMethods.length,
            }),
          ),
        }}
      />
      <PageHeader
        headingId="methods-listing-heading"
        eyebrow={dictionary.homeBrewingMethods.eyebrow}
        title={dictionary.homeBrewingMethods.title}
        description={dictionary.homeBrewingMethods.description}
      />

      <Folio ariaLabel={dictionary.homeBrewingMethods.title}>
        {content.brewMethods.map((method, index) => (
          <FolioItem
            key={method.name}
            href="/devices"
            index={String(index + 1).padStart(2, "0")}
            title={method.name}
            imageSrc={method.image}
            imageAlt={interpolate(dictionary.homeBrewingMethods.imageAltTemplate, {
              name: method.name,
              suitableRoast: method.suitableRoast,
            })}
            imageGrade="library"
            description={method.description}
            meta={
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className={acTypography.folioMeta}>
                  {dictionary.homeBrewingMethods.brewTimeLabel}: {method.brewTime}
                </span>
                <DifficultyIndicator
                  level={method.difficulty}
                  label={difficultyLabels[method.difficulty]}
                />
                <span className={acTypography.folioMeta}>
                  {dictionary.homeBrewingMethods.bodyLabel}: {method.body}
                </span>
              </div>
            }
          />
        ))}
      </Folio>
    </SectionFrame>
  );
}

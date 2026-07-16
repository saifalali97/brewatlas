import type { Metadata } from "next";
import { Folio, FolioItem } from "@/app/components/atlas/folio";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
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
    pathname: "/roasters",
    locale,
    title: dictionary.metadata.roastersTitle,
    description: dictionary.metadata.roastersDescription,
  });
}

export default async function RoastersPage() {
  const locale = await getLocale();
  const [dictionary, content] = await Promise.all([getDictionary(locale), getHomeContent(locale)]);

  const sortedRoasters = [...content.topRoasters].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <SectionFrame id="roasters-listing" ariaLabelledBy="roasters-listing-heading" padding="compact">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageJsonLd({
              url: localizedPathUrl("/roasters", locale),
              name: dictionary.homeTopRoasters.title,
              description: dictionary.homeTopRoasters.description,
              itemCount: content.topRoasters.length,
            }),
          ),
        }}
      />
      <PageHeader
        headingId="roasters-listing-heading"
        eyebrow={dictionary.homeTopRoasters.eyebrow}
        title={dictionary.homeTopRoasters.title}
        description={dictionary.homeTopRoasters.description}
      />

      <Folio ariaLabel={dictionary.homeTopRoasters.title}>
        {sortedRoasters.map((roaster, index) => (
          <FolioItem
            key={roaster.name}
            href="/recipes"
            index={String(index + 1).padStart(2, "0")}
            title={roaster.name}
            imageSrc={roaster.image}
            imageAlt={interpolate(dictionary.homeTopRoasters.imageAltTemplate, {
              name: roaster.name,
              country: roaster.country,
              founded: roaster.founded,
            })}
            imageGrade="directory"
            imageSize="large"
            description={roaster.description}
            meta={
              <p className={acTypography.folioMeta}>
                {roaster.country} · {dictionary.homeTopRoasters.foundedLabel} {roaster.founded} ·{" "}
                {roaster.recipes} {dictionary.homeTopRoasters.recipesCountLabel}
              </p>
            }
          />
        ))}
      </Folio>
    </SectionFrame>
  );
}

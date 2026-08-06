import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Chapter } from "@/app/components/atlas/chapter";
import { Folio, FolioItem } from "@/app/components/atlas/folio";
import { PageHeader } from "@/app/components/ui/page-header";
import { TextLink } from "@/app/components/ui/text-link";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { getGulfDirectoryRoastersByCountry } from "@/lib/data/gulf-directory";
import { findGulfCountryBySlug, gulfRoasterPath } from "@/lib/gulf-directory/countries";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { interpolate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata, localizedPathUrl } from "@/lib/seo/localized-metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";
import { createClient } from "@/lib/supabase/server";

type CountryPageProps = {
  params: Promise<{ countrySlug: string }>;
};

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { countrySlug } = await params;
  const country = findGulfCountryBySlug(countrySlug);
  if (!country) {
    return { title: "Country not found" };
  }

  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const countryName = dictionary.recipesDirectory.countries[countrySlug as keyof typeof dictionary.recipesDirectory.countries]?.name ?? country.dbCountry;

  return buildLocalizedMetadata({
    pathname: `/recipes/countries/${countrySlug}`,
    locale,
    title: interpolate(dictionary.recipesDirectory.countryMetaTitleTemplate, { country: countryName }),
    description: interpolate(dictionary.recipesDirectory.countryMetaDescriptionTemplate, { country: countryName }),
  });
}

export default async function GulfCountryRoastersPage({ params }: CountryPageProps) {
  const { countrySlug } = await params;
  const country = findGulfCountryBySlug(countrySlug);
  if (!country) notFound();

  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const roasters = await getGulfDirectoryRoastersByCountry(supabase, country.dbCountry);

  const countryCopy =
    dictionary.recipesDirectory.countries[countrySlug as keyof typeof dictionary.recipesDirectory.countries];
  const countryName = countryCopy?.name ?? country.dbCountry;
  const countryDescription = countryCopy?.description ?? "";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageJsonLd({
              url: localizedPathUrl(`/recipes/countries/${countrySlug}`, locale),
              name: countryName,
              description: countryDescription,
              itemCount: roasters.length,
            }),
          ),
        }}
      />
      <Chapter id="country-roasters" rhythm="dawn" padding="compact" wide ariaLabelledBy="country-roasters-heading">
        <div className="mb-8">
          <TextLink href="/recipes" variant="nav">
            {dictionary.recipesDirectory.backToCountries}
          </TextLink>
        </div>

        <PageHeader
          headingId="country-roasters-heading"
          eyebrow={dictionary.recipesDirectory.eyebrow}
          title={countryName}
          description={countryDescription}
        />

        {roasters.length > 0 ? (
          <Folio ariaLabel={countryName} className="mt-10">
            {roasters.map((roaster, index) => (
              <FolioItem
                key={roaster.id}
                href={roaster.slug ? gulfRoasterPath(roaster.slug) : "/recipes/browse"}
                index={String(index + 1).padStart(2, "0")}
                title={roaster.name}
                description={roaster.description ?? undefined}
                meta={
                  <p className={acTypography.folioMeta}>
                    {[roaster.city, roaster.emirate].filter(Boolean).join(", ")}
                    {roaster.recipeCount > 0
                      ? ` · ${interpolate(dictionary.recipesDirectory.recipeCountTemplate, {
                          count: String(roaster.recipeCount),
                        })}`
                      : ` · ${dictionary.recipesDirectory.noRecipesYet}`}
                  </p>
                }
              />
            ))}
          </Folio>
        ) : (
          <p className={`mt-10 ${acTypography.body} text-ac-espresso/75`}>
            {dictionary.recipesDirectory.noRoastersInCountry}
          </p>
        )}
      </Chapter>
    </>
  );
}

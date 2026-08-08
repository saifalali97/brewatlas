import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  GulfDirectoryPlaceholder,
  PlaceholderRecipeLink,
} from "@/app/components/recipes/gulf-directory-placeholder";
import { Chapter } from "@/app/components/atlas/chapter";
import { PageHeader } from "@/app/components/ui/page-header";
import { TextLink } from "@/app/components/ui/text-link";
import { RoasteryAboutSection } from "@/app/components/recipes/roastery-about-section";
import { RoasteryRecipeCard } from "@/app/components/recipes/roastery-recipe-card";
import {
  getGulfDirectoryRoasterBySlug,
  getRoasteryRecipes,
} from "@/lib/data/gulf-directory";
import {
  findGulfCountryBySlug,
  gulfCountryPath,
  gulfRecipePath,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import {
  findGulfCountryPageRoaster,
  getGulfCountryPageRecipesForRoaster,
} from "@/lib/gulf-directory/country-page-data";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { brewMethodLabelKey } from "@/lib/i18n/home-labels";
import { interpolate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import { imageAlt } from "@/lib/seo/image-alt";
import { buildLocalizedMetadata, localizedPathUrl } from "@/lib/seo/localized-metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";
import { createClient } from "@/lib/supabase/server";

type RoasteryPageProps = {
  params: Promise<{ countrySlug: string; roasterSlug: string }>;
};

export async function generateMetadata({ params }: RoasteryPageProps): Promise<Metadata> {
  const { countrySlug, roasterSlug } = await params;
  const country = findGulfCountryBySlug(countrySlug);
  if (!country) {
    return { title: "Roastery not found" };
  }

  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const placeholderRoaster = findGulfCountryPageRoaster(country.slug, roasterSlug);
  const supabase = placeholderRoaster ? null : await createClient();
  const dbRoaster =
    supabase != null ? await getGulfDirectoryRoasterBySlug(supabase, roasterSlug) : null;
  const roasterName = dbRoaster?.name ?? placeholderRoaster?.name ?? roasterSlug;

  return buildLocalizedMetadata({
    pathname: `/recipes/countries/${countrySlug}/roasters/${roasterSlug}`,
    locale,
    title: interpolate(dictionary.recipesDirectory.roasteryMetaTitleTemplate, {
      roaster: roasterName,
    }),
    description:
      dbRoaster?.description ??
      interpolate(dictionary.recipesDirectory.roasteryMetaDescriptionTemplate, {
        roaster: roasterName,
      }),
  });
}

export default async function GulfCountryRoasterPage({ params }: RoasteryPageProps) {
  const { countrySlug, roasterSlug } = await params;
  const country = findGulfCountryBySlug(countrySlug);
  if (!country) notFound();

  const slug = country.slug as GulfDirectoryCountrySlug;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const copy = dictionary.recipesDirectory;
  const countryName = copy.countries[slug]?.name ?? country.dbCountry;
  const placeholderRoaster = findGulfCountryPageRoaster(slug, roasterSlug);
  // Prefer directory placeholder while Supabase Gulf data is empty; fall back to DB.
  const supabase = placeholderRoaster ? null : await createClient();
  const dbRoaster =
    supabase != null ? await getGulfDirectoryRoasterBySlug(supabase, roasterSlug) : null;

  if (dbRoaster) {
    const recipes = await getRoasteryRecipes(supabase!, dbRoaster.id, { locale });
    const cardLabels = {
      hot: copy.hotBadge,
      iced: copy.icedBadge,
      deviceLabel: copy.deviceLabel,
      coffeeLabel: copy.coffeeLabel,
      ratingLabel: copy.ratingLabel,
      noRating: copy.noRating,
      imageAltTemplate: imageAlt.recipeTemplate,
      difficultyLabel: "",
      brewMethodLabel: "",
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildCollectionPageJsonLd({
                url: localizedPathUrl(
                  `/recipes/countries/${countrySlug}/roasters/${roasterSlug}`,
                  locale,
                ),
                name: dbRoaster.name,
                description: dbRoaster.description ?? `${dbRoaster.name} recipes`,
                itemCount: recipes.length,
              }),
            ),
          }}
        />
        <Chapter
          id="roastery-recipes"
          rhythm="dawn"
          padding="compact"
          wide
          ariaLabelledBy="roastery-recipes-heading"
        >
          <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <TextLink href="/recipes" variant="nav">
              {copy.backToCountries}
            </TextLink>
            <span className="text-ac-espresso/40" aria-hidden>
              /
            </span>
            <TextLink href={gulfCountryPath(slug)} variant="nav">
              {countryName}
            </TextLink>
          </div>

          <PageHeader
            headingId="roastery-recipes-heading"
            eyebrow={copy.roasteryEyebrow}
            title={dbRoaster.name}
            description={
              dbRoaster.city
                ? `${[dbRoaster.city, dbRoaster.emirate, dbRoaster.country].filter(Boolean).join(", ")}`
                : (dbRoaster.country ?? undefined)
            }
          />

          {recipes.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => {
                const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
                return (
                  <RoasteryRecipeCard
                    key={recipe.slug}
                    recipe={recipe}
                    href={gulfRecipePath(recipe.slug)}
                    labels={{
                      ...cardLabels,
                      brewMethodLabel: brewMethodKey
                        ? dictionary.homeFilters[
                            brewMethodKey as keyof typeof dictionary.homeFilters
                          ]
                        : recipe.brewMethod,
                      difficultyLabel: dictionary.homeDifficulty[
                        recipe.difficulty === "Advanced"
                          ? "advanced"
                          : recipe.difficulty === "Intermediate"
                            ? "intermediate"
                            : "beginner"
                      ],
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <p className="mt-10 text-ac-espresso/75">{copy.noRecipesForRoastery}</p>
          )}

          <RoasteryAboutSection
            roaster={dbRoaster}
            title={copy.aboutRoasteryTitle}
            websiteLabel={copy.websiteLabel}
            instagramLabel={copy.instagramLabel}
          />
        </Chapter>
      </>
    );
  }

  const roasterName = placeholderRoaster?.name ?? roasterSlug;
  const placeholderRecipes = getGulfCountryPageRecipesForRoaster(slug, roasterSlug);
  const description =
    placeholderRoaster != null
      ? `${placeholderRoaster.city} · ${placeholderRoaster.specialty}`
      : copy.countryPage.roasterPlaceholderDescription;

  return (
    <GulfDirectoryPlaceholder
      headingId="roastery-placeholder-heading"
      eyebrow={copy.roasteryEyebrow}
      title={roasterName}
      description={description}
      crumbs={[
        { href: "/recipes", label: copy.backToCountries },
        { href: gulfCountryPath(slug), label: countryName },
      ]}
    >
      {placeholderRecipes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {placeholderRecipes.map((recipe) => (
            <PlaceholderRecipeLink
              key={recipe.id}
              href={gulfRecipePath(recipe.slug)}
              name={recipe.name}
              meta={`${recipe.brewMethod} · ${recipe.difficulty}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-ac-espresso/75">{copy.countryPage.roasterPlaceholderDescription}</p>
      )}
    </GulfDirectoryPlaceholder>
  );
}

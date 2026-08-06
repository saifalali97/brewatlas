import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  findGulfCountryByDbCountry,
  gulfCountryPath,
} from "@/lib/gulf-directory/countries";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { interpolate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import { imageAlt } from "@/lib/seo/image-alt";
import { buildLocalizedMetadata, localizedPathUrl } from "@/lib/seo/localized-metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";
import { createClient } from "@/lib/supabase/server";

type RoasteryPageProps = {
  params: Promise<{ roasterSlug: string }>;
};

export async function generateMetadata({ params }: RoasteryPageProps): Promise<Metadata> {
  const { roasterSlug } = await params;
  const supabase = await createClient();
  const roaster = await getGulfDirectoryRoasterBySlug(supabase, roasterSlug);
  if (!roaster) {
    return { title: "Roastery not found" };
  }

  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return buildLocalizedMetadata({
    pathname: `/recipes/roasters/${roasterSlug}`,
    locale,
    title: interpolate(dictionary.recipesDirectory.roasteryMetaTitleTemplate, { roaster: roaster.name }),
    description:
      roaster.description ??
      interpolate(dictionary.recipesDirectory.roasteryMetaDescriptionTemplate, { roaster: roaster.name }),
  });
}

export default async function RoasteryRecipesPage({ params }: RoasteryPageProps) {
  const { roasterSlug } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();

  const roaster = await getGulfDirectoryRoasterBySlug(supabase, roasterSlug);
  if (!roaster) notFound();

  const recipes = await getRoasteryRecipes(supabase, roaster.id, { locale });
  const country = roaster.country ? findGulfCountryByDbCountry(roaster.country) : null;

  const cardLabels = {
    hot: dictionary.recipesDirectory.hotBadge,
    iced: dictionary.recipesDirectory.icedBadge,
    deviceLabel: dictionary.recipesDirectory.deviceLabel,
    coffeeLabel: dictionary.recipesDirectory.coffeeLabel,
    ratingLabel: dictionary.recipesDirectory.ratingLabel,
    noRating: dictionary.recipesDirectory.noRating,
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
              url: localizedPathUrl(`/recipes/roasters/${roasterSlug}`, locale),
              name: roaster.name,
              description: roaster.description ?? `${roaster.name} recipes`,
              itemCount: recipes.length,
            }),
          ),
        }}
      />
      <Chapter id="roastery-recipes" rhythm="dawn" padding="compact" wide ariaLabelledBy="roastery-recipes-heading">
        <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <TextLink href="/recipes" variant="nav">
            {dictionary.recipesDirectory.backToCountries}
          </TextLink>
          {country ? (
            <>
              <span className="text-ac-espresso/40" aria-hidden>
                /
              </span>
              <TextLink href={gulfCountryPath(country.slug)} variant="nav">
                {dictionary.recipesDirectory.countries[country.slug]?.name ?? country.dbCountry}
              </TextLink>
            </>
          ) : null}
        </div>

        <PageHeader
          headingId="roastery-recipes-heading"
          eyebrow={dictionary.recipesDirectory.roasteryEyebrow}
          title={roaster.name}
          description={
            roaster.city
              ? `${[roaster.city, roaster.emirate, roaster.country].filter(Boolean).join(", ")}`
              : (roaster.country ?? undefined)
          }
        />

        {recipes.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => {
              const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
              const difficultyKey = difficultyLabelKey(recipe.difficulty);
              return (
                <RoasteryRecipeCard
                  key={recipe.slug}
                  recipe={recipe}
                  href={`/recipes/${recipe.slug}`}
                  labels={{
                    ...cardLabels,
                    brewMethodLabel: brewMethodKey ? dictionary.homeFilters[brewMethodKey as keyof typeof dictionary.homeFilters] : recipe.brewMethod,
                    difficultyLabel: dictionary.homeFilters[difficultyKey as keyof typeof dictionary.homeFilters],
                  }}
                />
              );
            })}
          </div>
        ) : (
          <p className="mt-10 text-ac-espresso/75">{dictionary.recipesDirectory.noRecipesForRoastery}</p>
        )}

        <RoasteryAboutSection
          roaster={roaster}
          title={dictionary.recipesDirectory.aboutRoasteryTitle}
          websiteLabel={dictionary.recipesDirectory.websiteLabel}
          instagramLabel={dictionary.recipesDirectory.instagramLabel}
        />
      </Chapter>
    </>
  );
}

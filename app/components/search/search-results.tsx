"use client";

import Link from "next/link";
import { Folio, FolioItem } from "@/app/components/atlas/folio";
import { FavoriteButton } from "@/app/components/recipes/favorite-button";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { interpolate } from "@/lib/i18n/format";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { SearchResults } from "@/types/search";

type SearchResultsViewProps = {
  results: SearchResults;
  favoritedRecipeIds: string[];
  isAuthenticated: boolean;
  showAllSections: boolean;
};

function SectionHeading({
  id,
  title,
  count,
  href,
}: {
  id: string;
  title: string;
  count: number;
  href?: string;
}) {
  const { t } = useTranslations();

  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 id={id} className={acTypography.h2}>
        {title}
        <span className={`${acTypography.caption} ms-2 font-normal`}>({count})</span>
      </h2>
      {href && count > 0 ? (
        <Link href={href} className={`${acTypography.nav} text-ac-espresso hover:text-ba-bronze ${acFocus.ring}`}>
          {t("searchPage.viewAll")} →
        </Link>
      ) : null}
    </div>
  );
}

export function SearchResultsView({
  results,
  favoritedRecipeIds,
  isAuthenticated,
  showAllSections,
}: SearchResultsViewProps) {
  const { t } = useTranslations();
  const favoritedSet = new Set(favoritedRecipeIds);

  const hasAnyResults =
    results.recipes.length > 0 ||
    results.roasters.length > 0 ||
    results.origins.length > 0 ||
    results.devices.length > 0 ||
    results.varieties.length > 0 ||
    results.flavors.length > 0;

  if (!hasAnyResults) {
    return (
      <div className="border-b border-ac-espresso/[0.08] py-16 text-center">
        <p className={acTypography.body}>{t("emptyStates.noResults")}</p>
        <p className={`${acTypography.folioMeta} mx-auto mt-3 max-w-md`}>{t("emptyStates.noResultsHint")}</p>
        <Link
          href="/recipes"
          className={`${acTypography.nav} mt-8 inline-flex text-ac-espresso hover:text-ba-bronze ${acFocus.ring}`}
        >
          {t("emptyStates.startExploring")} →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      {(showAllSections || results.recipes.length > 0) && results.recipes.length > 0 ? (
        <section aria-labelledby="search-recipes-heading">
          <SectionHeading
            id="search-recipes-heading"
            title={t("searchPage.sectionRecipes")}
            count={results.totalRecipes}
            href={showAllSections ? "/search?cat=recipes" : undefined}
          />
          <Folio ariaLabel={t("searchPage.sectionRecipes")}>
            {results.recipes.map((recipe, index) => {
              const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
              const brewMethodLabel = brewMethodKey ? t(brewMethodKey) : recipe.brewMethod;

              return (
                <FolioItem
                  key={`${recipe.source}-${recipe.slug}`}
                  href={`/recipes/${recipe.slug}`}
                  index={String(index + 1).padStart(2, "0")}
                  title={recipe.name}
                  imageSrc={recipe.image}
                  imageAlt={interpolate(t("homeFeaturedRecipes.imageAltTemplate"), {
                    name: recipe.name,
                    country: recipe.country,
                    brewMethod: recipe.brewMethod,
                  })}
                  imageGrade="library"
                  meta={
                    <p className={acTypography.folioMeta}>
                      {recipe.country} · {brewMethodLabel} · {t(difficultyLabelKey(recipe.difficulty))}
                    </p>
                  }
                  trailing={
                    isAuthenticated && recipe.source === "db" && recipe.id ? (
                      <FavoriteButton
                        recipeId={recipe.id}
                        isFavorited={favoritedSet.has(recipe.id)}
                        currentPath="/search"
                      />
                    ) : undefined
                  }
                />
              );
            })}
          </Folio>
        </section>
      ) : null}

      {(showAllSections || results.roasters.length > 0) && results.roasters.length > 0 ? (
        <section aria-labelledby="search-roasters-heading">
          <SectionHeading
            id="search-roasters-heading"
            title={t("searchPage.sectionRoasters")}
            count={results.roasters.length}
            href={showAllSections ? "/search?cat=roasters" : undefined}
          />
          <Folio ariaLabel={t("searchPage.sectionRoasters")}>
            {results.roasters.map((roaster, index) => (
              <FolioItem
                key={roaster.name}
                href={`/search?cat=recipes&q=${encodeURIComponent(roaster.name)}`}
                index={String(index + 1).padStart(2, "0")}
                title={roaster.name}
                imageSrc={roaster.image}
                imageAlt={interpolate(t("homeTopRoasters.imageAltTemplate"), {
                  name: roaster.name,
                  country: roaster.country,
                  founded: roaster.founded,
                })}
                imageGrade="directory"
                description={roaster.description}
                meta={
                  <p className={acTypography.folioMeta}>
                    {roaster.country} · {roaster.recipes} {t("homeTopRoasters.recipesCountLabel")}
                  </p>
                }
              />
            ))}
          </Folio>
        </section>
      ) : null}

      {(showAllSections || results.origins.length > 0) && results.origins.length > 0 ? (
        <section aria-labelledby="search-origins-heading">
          <SectionHeading
            id="search-origins-heading"
            title={t("searchPage.sectionOrigins")}
            count={results.origins.length}
            href={showAllSections ? "/search?cat=origins" : undefined}
          />
          <Folio ariaLabel={t("searchPage.sectionOrigins")}>
            {results.origins.map((origin, index) => (
              <FolioItem
                key={`${origin.country}-${origin.region}`}
                href={`/search?cat=recipes&q=${encodeURIComponent(origin.country)}`}
                index={String(index + 1).padStart(2, "0")}
                title={origin.country}
                imageSrc={origin.image}
                imageAlt={interpolate(t("homeCoffeeOrigins.imageAltTemplate"), {
                  country: origin.country,
                  region: origin.region,
                  process: origin.process,
                })}
                imageGrade="earth"
                description={origin.tastingProfile}
                meta={
                  <p className={acTypography.folioMeta}>
                    {origin.region} · {origin.process}
                  </p>
                }
              />
            ))}
          </Folio>
        </section>
      ) : null}

      {(showAllSections || results.devices.length > 0) && results.devices.length > 0 ? (
        <section aria-labelledby="search-devices-heading">
          <SectionHeading
            id="search-devices-heading"
            title={t("searchPage.sectionDevices")}
            count={results.devices.length}
            href={showAllSections ? "/search?cat=devices" : undefined}
          />
          <Folio ariaLabel={t("searchPage.sectionDevices")}>
            {results.devices.map((device, index) => (
              <FolioItem
                key={`${device.source}-${device.id}`}
                href={`/search?cat=recipes&q=${encodeURIComponent(device.name)}`}
                index={String(index + 1).padStart(2, "0")}
                title={device.name}
                imageSrc={device.image ?? undefined}
                imageGrade="workshop"
                description={device.description ?? undefined}
                meta={
                  device.manufacturer ? (
                    <p className={acTypography.folioMeta}>{device.manufacturer}</p>
                  ) : undefined
                }
              />
            ))}
          </Folio>
        </section>
      ) : null}

      {(showAllSections || results.varieties.length > 0) && results.varieties.length > 0 ? (
        <section aria-labelledby="search-varieties-heading">
          <SectionHeading
            id="search-varieties-heading"
            title={t("searchPage.sectionVarieties")}
            count={results.varieties.length}
            href={showAllSections ? "/search?cat=varieties" : undefined}
          />
          <Folio ariaLabel={t("searchPage.sectionVarieties")}>
            {results.varieties.map((variety, index) => (
              <FolioItem
                key={variety.id}
                href={`/search?cat=recipes&q=${encodeURIComponent(variety.name)}`}
                index={String(index + 1).padStart(2, "0")}
                title={variety.name}
                description={
                  variety.variety ? `${t("searchPage.varietyLabel")}: ${variety.variety}` : undefined
                }
                meta={
                  <p className={acTypography.folioMeta}>
                    {[variety.roasterName, variety.region ? `${variety.region}, ${variety.country}` : variety.country, variety.process]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                }
              />
            ))}
          </Folio>
        </section>
      ) : null}

      {(showAllSections || results.flavors.length > 0) && results.flavors.length > 0 ? (
        <section aria-labelledby="search-flavors-heading">
          <SectionHeading
            id="search-flavors-heading"
            title={t("searchPage.sectionFlavors")}
            count={results.flavors.length}
            href={showAllSections ? "/search?cat=flavors" : undefined}
          />
          <Folio ariaLabel={t("searchPage.sectionFlavors")}>
            {results.flavors.map((flavor, index) => (
              <FolioItem
                key={flavor.id}
                href={`/recipes/${flavor.recipeSlug}`}
                index={String(index + 1).padStart(2, "0")}
                title={flavor.recipeName}
                description={flavor.flavorText}
                meta={
                  flavor.tags.length > 0 ? (
                    <p className={acTypography.folioMeta}>{flavor.tags.join(" · ")}</p>
                  ) : undefined
                }
              />
            ))}
          </Folio>
        </section>
      ) : null}
    </div>
  );
}

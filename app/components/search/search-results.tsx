"use client";

import Link from "next/link";
import { Cpu, Leaf, MapPin, Sparkles } from "lucide-react";
import { OriginCard } from "@/app/components/cards/origin-card";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { RoasterCard } from "@/app/components/cards/roaster-card";
import { FavoriteButton } from "@/app/components/recipes/favorite-button";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { cards } from "@/lib/constants/styles";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
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
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 id={id} className="text-lg font-semibold tracking-tight text-stone-50">
        {title}
        <span className="ms-2 text-sm font-normal text-stone-500">({count})</span>
      </h2>
      {href && count > 0 && (
        <RippleLink href={href} className="text-sm font-medium text-amber-500/90 hover:text-amber-400">
          {t("searchPage.viewAll")}
        </RippleLink>
      )}
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
      <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
        <p className="text-base font-medium text-stone-300">{t("emptyStates.noResults")}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">{t("emptyStates.noResultsHint")}</p>
        <RippleLink href="/recipes" className="mt-6 inline-flex text-sm font-medium text-amber-500/90 hover:text-amber-400">
          {t("emptyStates.startExploring")}
        </RippleLink>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {(showAllSections || results.recipes.length > 0) && results.recipes.length > 0 && (
        <section aria-labelledby="search-recipes-heading">
          <SectionHeading
            id="search-recipes-heading"
            title={t("searchPage.sectionRecipes")}
            count={results.totalRecipes}
            href={showAllSections ? "/search?cat=recipes" : undefined}
          />
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {results.recipes.map((recipe) => {
              const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
              return (
                <div key={`${recipe.source}-${recipe.slug}`} className="relative h-full">
                  <RecipeCard
                    recipe={recipe}
                    featured={Boolean(recipe.featured)}
                    href={`/recipes/${recipe.slug}`}
                    labels={{
                      premium: t("common.premiumBadge"),
                      editorsChoice: t("homeFeaturedRecipes.editorsChoice"),
                      ratio: t("homeFeaturedRecipes.ratioLabel"),
                      time: t("homeFeaturedRecipes.timeLabel"),
                      difficultyLabel: t(difficultyLabelKey(recipe.difficulty)),
                      brewMethodLabel: brewMethodKey ? t(brewMethodKey) : recipe.brewMethod,
                      imageAltTemplate: t("homeFeaturedRecipes.imageAltTemplate"),
                    }}
                  />
                  {isAuthenticated && recipe.source === "db" && recipe.id && (
                    <div className="pointer-events-none absolute inset-0">
                      <div className="pointer-events-auto absolute bottom-6 end-6 z-10">
                        <FavoriteButton
                          recipeId={recipe.id}
                          isFavorited={favoritedSet.has(recipe.id)}
                          currentPath="/search"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(showAllSections || results.roasters.length > 0) && results.roasters.length > 0 && (
        <section aria-labelledby="search-roasters-heading">
          <SectionHeading
            id="search-roasters-heading"
            title={t("searchPage.sectionRoasters")}
            count={results.roasters.length}
            href={showAllSections ? "/search?cat=roasters" : undefined}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.roasters.map((roaster) => (
              <RoasterCard
                key={roaster.name}
                roaster={roaster}
                ctaHref={`/search?cat=recipes&q=${encodeURIComponent(roaster.name)}`}
                labels={{
                  premium: t("common.premiumBadge"),
                  country: t("homeTopRoasters.countryLabel"),
                  founded: t("homeTopRoasters.foundedLabel"),
                  recipes: t("homeTopRoasters.recipesCountLabel"),
                  rating: t("homeTopRoasters.ratingLabel"),
                  viewRoaster: t("homeTopRoasters.viewRoaster"),
                  imageAltTemplate: t("homeTopRoasters.imageAltTemplate"),
                }}
              />
            ))}
          </div>
        </section>
      )}

      {(showAllSections || results.origins.length > 0) && results.origins.length > 0 && (
        <section aria-labelledby="search-origins-heading">
          <SectionHeading
            id="search-origins-heading"
            title={t("searchPage.sectionOrigins")}
            count={results.origins.length}
            href={showAllSections ? "/search?cat=origins" : undefined}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.origins.map((origin) => (
              <OriginCard
                key={`${origin.country}-${origin.region}`}
                origin={origin}
                ctaHref={`/search?cat=recipes&q=${encodeURIComponent(origin.country)}`}
                labels={{
                  premium: t("common.premiumBadge"),
                  altitude: t("homeCoffeeOrigins.altitudeLabel"),
                  process: t("homeCoffeeOrigins.processLabel"),
                  roast: t("homeCoffeeOrigins.roastLabel"),
                  brewMethod: t("homeCoffeeOrigins.brewMethodLabel"),
                  exploreOrigin: t("homeCoffeeOrigins.exploreOrigin"),
                  imageAltTemplate: t("homeCoffeeOrigins.imageAltTemplate"),
                }}
              />
            ))}
          </div>
        </section>
      )}

      {(showAllSections || results.devices.length > 0) && results.devices.length > 0 && (
        <section aria-labelledby="search-devices-heading">
          <SectionHeading
            id="search-devices-heading"
            title={t("searchPage.sectionDevices")}
            count={results.devices.length}
            href={showAllSections ? "/search?cat=devices" : undefined}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {results.devices.map((device) => (
              <Link
                key={`${device.source}-${device.id}`}
                href={`/search?cat=recipes&q=${encodeURIComponent(device.name)}`}
                className={`${cards.premiumShell} flex items-start gap-4 p-5 transition-transform hover:-translate-y-0.5`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-600/25 bg-amber-950/40">
                  <Cpu className="h-5 w-5 text-amber-500/85" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-50">{device.name}</h3>
                  {device.manufacturer && <p className="mt-1 text-sm text-stone-400">{device.manufacturer}</p>}
                  {device.description && <p className="mt-2 text-sm text-stone-500">{device.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(showAllSections || results.varieties.length > 0) && results.varieties.length > 0 && (
        <section aria-labelledby="search-varieties-heading">
          <SectionHeading
            id="search-varieties-heading"
            title={t("searchPage.sectionVarieties")}
            count={results.varieties.length}
            href={showAllSections ? "/search?cat=varieties" : undefined}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {results.varieties.map((variety) => (
              <Link
                key={variety.id}
                href={`/search?cat=recipes&q=${encodeURIComponent(variety.name)}`}
                className={`${cards.premiumShell} p-5 transition-transform hover:-translate-y-0.5`}
              >
                <div className="flex items-start gap-3">
                  <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/80" aria-hidden />
                  <div>
                    <h3 className="font-semibold text-stone-50">{variety.name}</h3>
                    {variety.variety && (
                      <p className="mt-1 text-sm text-stone-400">
                        {t("searchPage.varietyLabel")}: {variety.variety}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-500">
                      {variety.roasterName && <span>{variety.roasterName}</span>}
                      {variety.country && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" aria-hidden />
                          {variety.region ? `${variety.region}, ${variety.country}` : variety.country}
                        </span>
                      )}
                      {variety.process && <span>{variety.process}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(showAllSections || results.flavors.length > 0) && results.flavors.length > 0 && (
        <section aria-labelledby="search-flavors-heading">
          <SectionHeading
            id="search-flavors-heading"
            title={t("searchPage.sectionFlavors")}
            count={results.flavors.length}
            href={showAllSections ? "/search?cat=flavors" : undefined}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {results.flavors.map((flavor) => (
              <Link
                key={flavor.id}
                href={`/recipes/${flavor.recipeSlug}`}
                className={`${cards.premiumShell} p-5 transition-transform hover:-translate-y-0.5`}
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/80" aria-hidden />
                  <div>
                    <h3 className="font-semibold text-stone-50">{flavor.recipeName}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-400">{flavor.flavorText}</p>
                    {flavor.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {flavor.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-stone-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

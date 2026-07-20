import type { Metadata } from "next";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  Coffee,
  Cpu,
  Droplets,
  Filter,
  FlaskConical,
  Hand,
  Heart,
  Leaf,
  MapPin,
  Mountain,
  Percent,
  Scale,
  Settings2,
  Snowflake,
  Sprout,
  Thermometer,
  Users,
} from "lucide-react";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { RecipeConverterButton } from "@/app/components/converter/recipe-converter-button";
import { DeleteRecipeButton } from "@/app/components/recipes/delete-recipe-button";
import { FavoriteButton } from "@/app/components/recipes/favorite-button";
import { RecipeEditorialHero, RecipeEditorialSection } from "@/app/components/recipes/recipe-editorial-hero";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { badges, buttons } from "@/lib/constants/styles";
import { featuredRecipes as staticRecipesEn } from "@/data/homepage";
import { getCachedPublishedDbRecipes } from "@/lib/data/cached-public-data";
import { getAllRecipeSlugs, getRecipeSlug, getStaticRecipeIndexBySlug } from "@/lib/data/recipes";
import { getDbRecipeDetailBySlug, getFavoritesCount, getUserFavoriteRecipeIds } from "@/lib/data/db-recipes";
import { recipeHasXBloomProfile } from "@/lib/data/xbloom";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { translate, interpolate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/types";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { resolveSitePathname } from "@/lib/seo/path-utils";
import { buildRecipeReviewJsonLd, buildStaticRecipeJsonLd } from "@/lib/seo/recipe-review-json-ld";
import { RecipeGuideSections, RecipeTextExtrasSections } from "@/app/components/recipes/recipe-guide-sections";
import { getStaticRecipeDetail } from "@/lib/data/static-recipe-details";
import { getRecipeTranslation, localizeRecipe } from "@/lib/data/translations";
import { RecipeReviewsPanel } from "@/lib/dynamic-sections";
import { RecipeRatingBadge } from "@/app/components/reviews/recipe-rating-badge";
import {
  getRecipeRatingDistribution,
  getRecipeRatingSummary,
  getRecipeReviewsPage,
  getUserRecipeReview,
  parseReviewSort,
} from "@/lib/data/community";
import { isRecipePubliclyVisible } from "@/lib/recipes/recipe-status";
import { canAccessFullRecipeContent } from "@/lib/membership/premium";
import { recordRecipeView } from "@/lib/data/recipe-analytics";
import { getMembershipSummary } from "@/lib/data/membership";
import { createClient } from "@/lib/supabase/server";
import { getUserBrewingSetup } from "@/lib/data/brewing-setup";
import { evaluateRecipeSetupCompatibility } from "@/lib/recipes/setup-compatibility";
import { RecipeSetupCompatibilityPanel } from "@/app/components/recipes/recipe-setup-compatibility";
import { OfficialRecipeDetailPanel } from "@/app/components/recipes/official-recipe-detail-panel";
import type { RecipeSetupCompatibility } from "@/types/brewing-setup";
import { RecipePremiumPaywall } from "@/app/components/recipes/recipe-premium-paywall";
import type { FeaturedRecipe } from "@/types/homepage";
import { RECIPE_IMAGE_PLACEHOLDER, type RecipeFullDetail } from "@/types/recipe";
import type {
  RatingDistributionBucket,
  RecipeRatingSummary,
  RecipeReview,
  RecipeReviewsResult,
} from "@/types/community";

function CompatibleDevices({ hasXBloom, dictionary }: { hasXBloom: boolean; dictionary: Dictionary }) {
  return (
    <div className="mt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ac-espresso">
        {dictionary.recipeDetail.compatibleDevicesLabel}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ba-espresso/[0.12] bg-ba-sand/35 px-3 py-1 text-xs font-medium text-ac-espresso">
          <Hand className="h-3 w-3 text-ac-espresso" aria-hidden />
          {dictionary.recipeDetail.manualDevice}
        </span>
        {hasXBloom && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ba-gold/30 bg-ba-gold/15 px-3 py-1 text-xs font-medium text-ac-espresso">
            <Cpu className="h-3 w-3 text-ac-espresso" aria-hidden />
            {dictionary.recipeDetail.xbloomDevice}
          </span>
        )}
      </div>
    </div>
  );
}

type RecipePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reviewSort?: string; reviewPage?: string }>;
};

export function generateStaticParams() {
  return getAllRecipeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const staticIndex = getStaticRecipeIndexBySlug(slug);

  if (staticIndex !== -1) {
    const content = await getHomeContent(locale);
    const recipe = content.featuredRecipes[staticIndex];
    return buildLocalizedMetadata({
      pathname: `/recipes/${slug}`,
      locale,
      title: recipe.name,
      description: recipe.notes,
      ogImage: { url: recipe.image },
    });
  }

  const supabase = await createClient();
  const dictionary = await getDictionary(locale);
  const dbRecipe = await getDbRecipeDetailBySlug(supabase, slug);

  if (!dbRecipe) {
    return buildLocalizedMetadata({
      pathname: `/recipes/${slug}`,
      locale,
      title: dictionary.metadata.recipeNotFoundTitle,
      description: dictionary.metadata.notFoundDescription,
      noIndex: true,
    });
  }

  const ratingSummary = await getRecipeRatingSummary(supabase, dbRecipe.id);
  const descriptionBase = dbRecipe.seoDescription ?? dbRecipe.tastingNotes ?? dbRecipe.description ?? undefined;
  const countLabel =
    ratingSummary.reviewCount === 1
      ? interpolate(dictionary.recipeReviews.reviewCountSingular, { count: ratingSummary.reviewCount })
      : interpolate(dictionary.recipeReviews.reviewCountPlural, { count: ratingSummary.reviewCount });
  const ratingSuffix =
    ratingSummary.reviewCount > 0 && ratingSummary.averageRating !== null
      ? ` · ${ratingSummary.averageRating.toFixed(1)}/5 (${countLabel})`
      : "";
  const description = descriptionBase ? `${descriptionBase}${ratingSuffix}` : undefined;
  const title = dbRecipe.seoTitle ?? dbRecipe.title;
  const pathname = resolveSitePathname(dbRecipe.canonicalUrl ?? `/recipes/${slug}`, `/recipes/${slug}`);
  const indexable = isRecipePubliclyVisible({ status: dbRecipe.status });

  return buildLocalizedMetadata({
    pathname,
    locale,
    title,
    description: description ?? dictionary.metadata.recipesDescription,
    ogImage: dbRecipe.coverImageUrl ? { url: dbRecipe.coverImageUrl, alt: title } : undefined,
    noIndex: !indexable,
  });
}

export default async function RecipePage({ params, searchParams }: RecipePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const reviewSort = parseReviewSort(resolvedSearchParams.reviewSort);
  const reviewPage = Math.max(1, Number.parseInt(resolvedSearchParams.reviewPage ?? "1", 10) || 1);
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const staticIndex = getStaticRecipeIndexBySlug(slug);

  if (staticIndex !== -1) {
    const content = await getHomeContent(locale);
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const membership = authData.user ? await getMembershipSummary(supabase, authData.user.id) : null;
    const recipe = content.featuredRecipes[staticIndex];
    const canAccessFull = canAccessFullRecipeContent(
      membership,
      { premiumOnly: Boolean(recipe.premium) },
      authData.user ? undefined : { guestRecipeIndex: staticIndex },
    );
    const staticJsonLd = buildStaticRecipeJsonLd({
      recipe,
      slug,
      locale,
      breadcrumbs: [
        { name: dictionary.nav.home, path: "/" },
        { name: dictionary.nav.recipes, path: "/recipes" },
        { name: recipe.name, path: `/recipes/${slug}` },
      ],
    });

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(staticJsonLd) }}
        />
        <StaticRecipeView
          recipe={recipe}
          slug={slug}
          dictionary={dictionary}
          isAuthenticated={Boolean(authData.user)}
          canAccessFull={canAccessFull}
          detail={getStaticRecipeDetail(slug)}
        />
      </>
    );
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const recipe = await getDbRecipeDetailBySlug(supabase, slug);

  if (!recipe) {
    notFound();
  }

  const translation = await getRecipeTranslation(supabase, recipe.id, locale);
  const localizedRecipe = localizeRecipe(recipe, translation);

  const viewerId = authData.user?.id ?? null;

  const [favoritesCount, favoriteIds, hasXBloomProfile, ratingSummary, ratingDistribution, reviewsResult, userReview, membership, guestRecipeIndex, userSetup] =
    await Promise.all([
      getFavoritesCount(supabase, recipe.id),
      viewerId ? getUserFavoriteRecipeIds(supabase, viewerId) : Promise.resolve(new Set<string>()),
      recipeHasXBloomProfile(supabase, recipe.id),
      getRecipeRatingSummary(supabase, recipe.id),
      getRecipeRatingDistribution(supabase, recipe.id),
      getRecipeReviewsPage(supabase, recipe.id, { sort: reviewSort, page: reviewPage, viewerId }),
      viewerId ? getUserRecipeReview(supabase, recipe.id, viewerId) : Promise.resolve(null),
      viewerId ? getMembershipSummary(supabase, viewerId) : Promise.resolve(null),
      viewerId
        ? Promise.resolve(undefined)
        : (async () => {
            const content = await getHomeContent(locale);
            const staticSlugs = content.featuredRecipes.map((_entry, index) => getRecipeSlug(staticRecipesEn[index]));
            const dbRecipes = await getCachedPublishedDbRecipes(locale);
            const allSlugs = [...staticSlugs, ...dbRecipes.map((entry) => entry.slug)];
            return allSlugs.indexOf(slug);
          })(),
      viewerId ? getUserBrewingSetup(supabase, viewerId) : Promise.resolve(null),
    ]);

  const setupCompatibility =
    userSetup ? evaluateRecipeSetupCompatibility(localizedRecipe, userSetup) : null;

  const isOwner = Boolean(viewerId && recipe.authorId === viewerId);
  const canAccessFull =
    isOwner ||
    canAccessFullRecipeContent(membership, recipe, viewerId ? undefined : { guestRecipeIndex: guestRecipeIndex ?? -1 });

  void recordRecipeView(supabase, recipe.id, viewerId);
  const reviewJsonLd = buildRecipeReviewJsonLd({
    recipe,
    slug,
    summary: ratingSummary,
    reviews: reviewsResult.reviews,
    locale,
    breadcrumbs: [
      { name: dictionary.nav.home, path: "/" },
      { name: dictionary.nav.recipes, path: "/recipes" },
      { name: recipe.title, path: `/recipes/${slug}` },
    ],
  });

  return (
    <DbRecipeView
      recipe={localizedRecipe}
      slug={slug}
      favoritesCount={favoritesCount}
      isFavorited={favoriteIds.has(recipe.id)}
      isOwner={isOwner}
      isAuthenticated={Boolean(viewerId)}
      canAccessFull={canAccessFull}
      hasXBloomProfile={hasXBloomProfile}
      dictionary={dictionary}
      ratingSummary={ratingSummary}
      ratingDistribution={ratingDistribution}
      reviewsResult={reviewsResult}
      userReview={userReview}
      viewerId={viewerId}
      reviewJsonLd={reviewJsonLd}
      setupCompatibility={setupCompatibility}
    />
  );
}

function StaticRecipeView({
  recipe,
  slug,
  dictionary,
  isAuthenticated,
  canAccessFull,
  detail,
}: {
  recipe: FeaturedRecipe;
  slug: string;
  dictionary: Dictionary;
  isAuthenticated: boolean;
  canAccessFull: boolean;
  detail?: ReturnType<typeof getStaticRecipeDetail>;
}) {
  const d = dictionary.recipeDetail;
  const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
  const brewMethodLabel = brewMethodKey ? translate(dictionary, brewMethodKey) : recipe.brewMethod;

  return (
    <SectionFrame id="recipe-detail" ariaLabelledBy="recipe-detail-heading" padding="compact" wide>
      <RecipeEditorialHero
        backHref="/recipes"
        backLabel={d.backToAllRecipes}
        imageSrc={recipe.image}
        imageAlt={`${recipe.name} ${recipe.country} ${recipe.brewMethod} ${recipe.roastLevel}`}
        eyebrow={recipe.country}
        title={recipe.name}
        lead={recipe.notes}
        badge={
          recipe.premium ? (
            <span className={badges.premium}>{dictionary.common.premiumBadge}</span>
          ) : undefined
        }
        overlay={
          <span className={`${acTypography.caption} inline-flex items-center gap-1.5 rounded-full border border-ac-espresso/10 bg-ac-pearl/90 px-3 py-1 text-ac-espresso backdrop-blur-sm`}>
            <MapPin className="h-3 w-3 text-ac-copper" aria-hidden />
            {recipe.origin}
          </span>
        }
      />

      <div className="mx-auto max-w-3xl">
        <div className="mt-10">
          <DifficultyIndicator
            level={recipe.difficulty}
            label={translate(dictionary, difficultyLabelKey(recipe.difficulty))}
            labelClassName={`${acTypography.folioMeta} text-sm`}
            className="flex items-center gap-2.5"
          />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <MetaTile icon={Coffee} label={d.brewMethodLabel} value={brewMethodLabel} />
          <MetaTile icon={Scale} label={d.ratioLabel} value={recipe.ratio} />
          <MetaTile icon={Clock} label={d.brewTimeLabel} value={recipe.time} />
          <MetaTile icon={MapPin} label={d.roastLevelLabel} value={recipe.roastLevel} />
        </div>

        <CompatibleDevices hasXBloom={false} dictionary={dictionary} />

        {!recipe.premium && canAccessFull ? (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <RippleLink href="/recipes" className={`${buttons.secondary} w-full sm:w-auto`}>
              {d.browseMoreRecipes}
            </RippleLink>
            <RecipeConverterButton currentDevice={brewMethodLabel} sourceRecipe={{ brewTime: recipe.time }} />
          </div>
        ) : null}
      </div>

      {!canAccessFull && (
        <RecipePremiumPaywall dictionary={dictionary} isAuthenticated={isAuthenticated} recipeSlug={slug} />
      )}

      {canAccessFull && detail ? (
        <RecipeGuideSections detail={detail} recipe={recipe} dictionary={dictionary} />
      ) : null}
    </SectionFrame>
  );
}

type DbRecipeViewProps = {
  recipe: RecipeFullDetail;
  slug: string;
  favoritesCount: number;
  isFavorited: boolean;
  isOwner: boolean;
  isAuthenticated: boolean;
  canAccessFull: boolean;
  hasXBloomProfile: boolean;
  dictionary: Dictionary;
  ratingSummary: RecipeRatingSummary;
  ratingDistribution: RatingDistributionBucket[];
  reviewsResult: RecipeReviewsResult;
  userReview: RecipeReview | null;
  viewerId: string | null;
  reviewJsonLd: Record<string, unknown>;
  setupCompatibility: RecipeSetupCompatibility | null;
};

function DbRecipeView({
  recipe,
  slug,
  favoritesCount,
  isFavorited,
  isOwner,
  isAuthenticated,
  canAccessFull,
  hasXBloomProfile,
  dictionary,
  ratingSummary,
  ratingDistribution,
  reviewsResult,
  userReview,
  viewerId,
  reviewJsonLd,
  setupCompatibility,
}: DbRecipeViewProps) {
  const d = dictionary.recipeDetail;
  const coverImage = recipe.coverImageUrl ?? RECIPE_IMAGE_PLACEHOLDER;
  const coverAlt = recipe.coverImageAlt ?? d.recipeCoverAltTemplate.replace("{title}", recipe.title);
  const notes = recipe.tastingNotes ?? recipe.description ?? d.noTastingNotes;
  const ratings = [
    { label: dictionary.homeBrewingMethods.sweetnessLabel, value: recipe.sweetness },
    { label: dictionary.homeBrewingMethods.acidityLabel, value: recipe.acidity },
    { label: dictionary.homeBrewingMethods.bodyLabel, value: recipe.body },
    { label: d.bitternessLabel, value: recipe.bitterness },
  ].filter((rating) => rating.value !== null);

  const hasCoffeeInfo = Boolean(
    recipe.coffeeName || recipe.roasterName || recipe.originLabel || recipe.farm || recipe.producer,
  );
  const hasResults = Boolean(
    recipe.totalBrewTime || recipe.beverageWeight || recipe.tds || recipe.extractionPercentage || ratings.length > 0,
  );

  return (
    <SectionFrame id="recipe-detail" ariaLabelledBy="recipe-detail-heading" padding="compact" wide>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />
      <RecipeEditorialHero
        backHref="/recipes"
        backLabel={d.backToAllRecipes}
        imageSrc={coverImage}
        imageAlt={coverAlt}
        blurDataUrl={recipe.coverImageBlur}
        imageWidth={recipe.coverImageWidth}
        imageHeight={recipe.coverImageHeight}
        eyebrow={recipe.roasterName ?? d.communityRecipe}
        title={recipe.title}
        lead={notes}
        badge={
          <>
            {!recipe.published ? (
              <span className="me-2 rounded-full border border-ac-espresso/15 bg-ac-pearl/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ac-espresso backdrop-blur-sm">
                {d.draftBadge}
              </span>
            ) : null}
            {recipe.premiumOnly ? (
              <span className={badges.premium}>{dictionary.common.premiumBadge}</span>
            ) : null}
          </>
        }
        overlay={
          recipe.originLabel ? (
            <span className={`${acTypography.caption} inline-flex items-center gap-1.5 rounded-full border border-ac-espresso/10 bg-ac-pearl/90 px-3 py-1 text-ac-espresso backdrop-blur-sm`}>
              <MapPin className="h-3 w-3 text-ac-copper" aria-hidden />
              {recipe.originLabel}
            </span>
          ) : undefined
        }
        actions={
          <div className="flex flex-wrap items-center gap-4">
            <RecipeRatingBadge summary={ratingSummary} labels={dictionary.recipeReviews} />
            <span className={`${acTypography.folioMeta} flex items-center gap-1.5`}>
              <Heart className="h-3.5 w-3.5 text-ac-copper" aria-hidden />
              {favoritesCount}
            </span>
            {isAuthenticated ? (
              <FavoriteButton recipeId={recipe.id} isFavorited={isFavorited} currentPath={`/recipes/${slug}`} />
            ) : null}
          </div>
        }
      />

      <div className="mx-auto max-w-3xl">
        {recipe.difficulty ? (
          <div className="mt-10">
            <DifficultyIndicator
              level={recipe.difficulty}
              label={translate(dictionary, difficultyLabelKey(recipe.difficulty))}
              labelClassName={`${acTypography.folioMeta} text-sm`}
              className="flex items-center gap-2.5"
            />
          </div>
        ) : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <MetaTile icon={Coffee} label={d.brewMethodLabel} value={recipe.brewingMethodName ?? d.customValue} />
          <MetaTile icon={Scale} label={d.ratioLabel} value={recipe.ratio ?? d.dashValue} />
          <MetaTile
            icon={Clock}
            label={d.brewTimeLabel}
            value={recipe.totalBrewTime ?? recipe.estimatedBrewTime ?? d.dashValue}
          />
          {recipe.roastLevel ? (
            <MetaTile icon={MapPin} label={d.roastLevelLabel} value={recipe.roastLevel} />
          ) : null}
        </div>

        <CompatibleDevices hasXBloom={hasXBloomProfile} dictionary={dictionary} />

        <div className="mt-10 flex flex-wrap gap-3">
            {isOwner ? (
              <>
                <RippleLink href={`/account/recipes/${recipe.id}/edit`} className={`${buttons.primary} w-full sm:w-auto`}>
                  {dictionary.recipes.editRecipe}
                </RippleLink>
                <DeleteRecipeButton recipeId={recipe.id} recipeTitle={recipe.title} />
              </>
            ) : canAccessFull ? (
              <>
                <RippleLink href="/recipes" className={`${buttons.secondary} w-full sm:w-auto`}>
                  {d.browseMoreRecipes}
                </RippleLink>
                {recipe.videoUrl && (
                  <a
                    href={recipe.videoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`${buttons.secondary} w-full sm:w-auto`}
                  >
                    {d.watchVideo}
                  </a>
                )}
              </>
            ) : null}
            {canAccessFull && (
              <RecipeConverterButton
                currentDevice={recipe.deviceName ?? recipe.brewingMethodName ?? d.dashValue}
                sourceRecipe={{
                  doseG: recipe.coffeeDose,
                  waterG: recipe.waterAmount,
                  grindSize: recipe.grindSize,
                  temperatureC: recipe.waterTemperature,
                  bloomAmountG: recipe.bloomAmount,
                  bloomTime: recipe.bloomTime,
                  brewTime: recipe.totalBrewTime ?? recipe.estimatedBrewTime,
                  poursCount: recipe.pours.length > 0 ? recipe.pours.length : null,
                }}
              />
            )}
          </div>
      </div>

      {!canAccessFull && (
        <RecipePremiumPaywall dictionary={dictionary} isAuthenticated={isAuthenticated} recipeSlug={slug} />
      )}

      {canAccessFull && hasCoffeeInfo && (
        <RecipeEditorialSection title={d.coffeeSectionTitle} className="mt-14">
          <div className="grid gap-3 sm:grid-cols-2">
            {recipe.coffeeName && <MetaTile icon={Coffee} label={d.coffeeLabel} value={recipe.coffeeName} />}
            {recipe.farm && <MetaTile icon={Sprout} label={d.farmLabel} value={recipe.farm} />}
            {recipe.producer && <MetaTile icon={Users} label={d.producerLabel} value={recipe.producer} />}
            {recipe.variety && <MetaTile icon={Leaf} label={d.varietyLabel} value={recipe.variety} />}
            {recipe.process && (
              <MetaTile icon={Droplets} label={dictionary.homeCoffeeOrigins.processLabel} value={recipe.process} />
            )}
            {recipe.altitude && (
              <MetaTile icon={Mountain} label={dictionary.homeCoffeeOrigins.altitudeLabel} value={recipe.altitude} />
            )}
            {recipe.roastDate && <MetaTile icon={Calendar} label={d.roastDateLabel} value={recipe.roastDate} />}
          </div>
        </RecipeEditorialSection>
      )}

      {canAccessFull && (
        <>
          <RecipeEditorialSection title={d.brewingDetailsTitle} className="mt-14">
            <div className="grid gap-3 sm:grid-cols-2">
              {recipe.deviceName && <MetaTile icon={Settings2} label={d.deviceLabel} value={recipe.deviceName} />}
              {recipe.grinderName && <MetaTile icon={Settings2} label={d.grinderLabel} value={recipe.grinderName} />}
              {recipe.grindSize && <MetaTile icon={Settings2} label={d.grindSizeLabel} value={recipe.grindSize} />}
              {recipe.filterTypeName && <MetaTile icon={Filter} label={d.filterLabel} value={recipe.filterTypeName} />}
              {recipe.waterProfileName && (
                <MetaTile icon={Droplets} label={d.waterRecipeLabel} value={recipe.waterProfileName} />
              )}
              {recipe.waterTemperature !== null && (
                <MetaTile icon={Thermometer} label={d.waterTempLabel} value={`${recipe.waterTemperature}°C`} />
              )}
              {recipe.coffeeDose !== null && (
                <MetaTile icon={Scale} label={d.coffeeDoseLabel} value={`${recipe.coffeeDose}g`} />
              )}
              {recipe.waterAmount !== null && (
                <MetaTile icon={Droplets} label={d.waterLabel} value={`${recipe.waterAmount}g`} />
              )}
              {recipe.bloomAmount !== null && (
                <MetaTile
                  icon={Droplets}
                  label={d.bloomLabel}
                  value={`${recipe.bloomAmount}g${recipe.bloomTime ? ` / ${recipe.bloomTime}` : ""}`}
                />
              )}
              {recipe.iceAmount !== null && recipe.iceAmount > 0 && (
                <MetaTile icon={Snowflake} label={d.iceLabel} value={`${recipe.iceAmount}g`} />
              )}
            </div>
          </RecipeEditorialSection>

          {recipe.pours.length > 0 && (
            <RecipeEditorialSection title={d.pourStructureTitle} className="mt-14">
              <ol className="space-y-3">
                {recipe.pours.map((pour) => (
                  <li
                    key={pour.id}
                    className="ac-folio-divider flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4"
                  >
                    <span className="text-sm font-medium text-ac-espresso">
                      {d.pourPrefix} {pour.pour_number}
                    </span>
                    {pour.water_amount !== null && <span className="text-sm text-ac-espresso">{pour.water_amount}g</span>}
                    {pour.time_label && (
                      <span className="text-sm text-ac-espresso">
                        {d.atTimeLabel} {pour.time_label}
                      </span>
                    )}
                    {pour.notes && <span className="text-sm text-ac-espresso">— {pour.notes}</span>}
                  </li>
                ))}
              </ol>
            </RecipeEditorialSection>
          )}

          {hasResults && (
            <RecipeEditorialSection title={d.resultsTitle} className="mt-14">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {recipe.beverageWeight !== null && (
                  <MetaTile icon={Scale} label={d.beverageWeightLabel} value={`${recipe.beverageWeight}g`} />
                )}
                {recipe.tds !== null && <MetaTile icon={FlaskConical} label={d.tdsLabel} value={`${recipe.tds}%`} />}
                {recipe.extractionPercentage !== null && (
                  <MetaTile icon={Percent} label={d.extractionLabel} value={`${recipe.extractionPercentage}%`} />
                )}
                {ratings.map((rating) => (
                  <MetaTile key={rating.label} icon={Coffee} label={rating.label} value={`${rating.value}/10`} />
                ))}
              </div>
            </RecipeEditorialSection>
          )}

          {recipe.tags.length > 0 && (
            <div className="mx-auto mt-10 flex max-w-3xl flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-ba-espresso/[0.12] bg-ba-sand/35 px-3 py-1 text-xs font-medium text-ac-espresso"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <OfficialRecipeDetailPanel recipe={recipe} />
          {setupCompatibility ? <RecipeSetupCompatibilityPanel compatibility={setupCompatibility} /> : null}

          {recipe.instructions && (
            <RecipeEditorialSection title={dictionary.recipes.instructions} className="mt-14">
              <p className={`${acTypography.body} whitespace-pre-line`}>{recipe.instructions}</p>
            </RecipeEditorialSection>
          )}

          <RecipeTextExtrasSections
            dictionary={dictionary}
            brewNotes={recipe.brewNotes}
            tips={recipe.tips}
            warnings={recipe.warnings}
          />

          {recipe.images.length > 0 && (
            <RecipeEditorialSection title={d.galleryTitle} className="mt-14">
              <div className="grid gap-4 sm:grid-cols-2">
                {recipe.images.map((image) => (
                  <div key={image.id} className="relative h-48 overflow-hidden rounded-xl border border-white/[0.1]">
                    <OptimizedImage
                      src={image.url}
                      alt={image.altText ?? d.additionalPhotoAltTemplate.replace("{title}", recipe.title)}
                      blurDataUrl={image.blurDataUrl}
                      width={image.width ?? undefined}
                      height={image.height ?? undefined}
                      sizes={IMAGE_SIZE_PRESETS.recipeGallery}
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </RecipeEditorialSection>
          )}
        </>
      )}

      <RecipeReviewsPanel
        recipeId={recipe.id}
        recipeSlug={slug}
        summary={ratingSummary}
        distribution={ratingDistribution}
        reviewsResult={reviewsResult}
        userReview={userReview}
        viewerId={viewerId}
        isAuthenticated={isAuthenticated}
        reviewLabels={dictionary.recipeReviews}
      />
    </SectionFrame>
  );
}

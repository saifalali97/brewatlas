import type { Metadata } from "next";
import Link from "next/link";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
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
import { cards, buttons } from "@/lib/constants/styles";
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
import { buildRecipeReviewJsonLd } from "@/lib/seo/recipe-review-json-ld";
import { RecipeReviewsPanel } from "@/app/components/reviews/recipe-reviews-panel";
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
import { RECIPE_IMAGE_PLACEHOLDER, type RecipeFullDetail } from "@/types/recipe";
import { RecipePremiumPaywall } from "@/app/components/recipes/recipe-premium-paywall";
import type { FeaturedRecipe } from "@/types/homepage";
import type {
  RatingDistributionBucket,
  RecipeRatingSummary,
  RecipeReview,
  RecipeReviewsResult,
} from "@/types/community";

function CompatibleDevices({ hasXBloom, dictionary }: { hasXBloom: boolean; dictionary: Dictionary }) {
  return (
    <div className="mt-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
        {dictionary.recipeDetail.compatibleDevicesLabel}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1 text-xs font-medium text-stone-300">
          <Hand className="h-3 w-3 text-stone-400" aria-hidden />
          {dictionary.recipeDetail.manualDevice}
        </span>
        {hasXBloom && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/30 bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-200/90">
            <Cpu className="h-3 w-3 text-amber-400/90" aria-hidden />
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

    return (
      <StaticRecipeView
        recipe={recipe}
        slug={slug}
        dictionary={dictionary}
        isAuthenticated={Boolean(authData.user)}
        canAccessFull={canAccessFull}
      />
    );
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const recipe = await getDbRecipeDetailBySlug(supabase, slug);

  if (!recipe) {
    notFound();
  }

  const viewerId = authData.user?.id ?? null;

  const [favoritesCount, favoriteIds, hasXBloomProfile, ratingSummary, ratingDistribution, reviewsResult, userReview, membership, guestRecipeIndex] =
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
    ]);

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
  });

  return (
    <DbRecipeView
      recipe={recipe}
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
    />
  );
}

function StaticRecipeView({
  recipe,
  slug,
  dictionary,
  isAuthenticated,
  canAccessFull,
}: {
  recipe: FeaturedRecipe;
  slug: string;
  dictionary: Dictionary;
  isAuthenticated: boolean;
  canAccessFull: boolean;
}) {
  const d = dictionary.recipeDetail;
  const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
  const brewMethodLabel = brewMethodKey ? translate(dictionary, brewMethodKey) : recipe.brewMethod;

  return (
    <SectionFrame id="recipe-detail" ariaLabelledBy="recipe-detail-heading" padding="compact">
      <Link
        href="/recipes"
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-stone-400 transition-colors duration-300 hover:text-amber-400/90"
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        {d.backToAllRecipes}
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative h-72 overflow-hidden rounded-[1.5rem] border border-white/[0.11] sm:h-96 lg:h-full lg:min-h-[26rem]">
          <OptimizedImage
            src={recipe.image}
            alt={`${recipe.name} ${recipe.country} ${recipe.brewMethod} ${recipe.roastLevel}`}
            sizes={IMAGE_SIZE_PRESETS.recipeDetailCover}
            priority
            className="object-cover brightness-[0.9] contrast-[1.04] saturate-[0.94]"
          />
          <div className={cards.imageOverlay} />
          <div className={cards.imageAmberWash} />

          {recipe.premium && (
            <div className="absolute end-5 top-5 rounded-full border border-amber-700/35 bg-amber-950/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90 backdrop-blur-xl">
              {dictionary.common.premiumBadge}
            </div>
          )}

          <div className="absolute bottom-5 start-5 flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#0a0705]/55 px-3 py-1 text-[10px] font-medium text-stone-200 backdrop-blur-xl">
            <MapPin className="h-3 w-3 text-amber-500/80" aria-hidden />
            {recipe.origin}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-600/70">{recipe.country}</p>
          <h1
            id="recipe-detail-heading"
            className="mt-3 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-stone-50 sm:text-4xl"
          >
            {recipe.name}
          </h1>
          <p className="mt-5 text-lg leading-[1.75] text-stone-400">{recipe.notes}</p>

          <div className="mt-8">
            <DifficultyIndicator
              level={recipe.difficulty}
              label={translate(dictionary, difficultyLabelKey(recipe.difficulty))}
              labelClassName="text-sm text-stone-400"
              className="flex items-center gap-2.5"
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MetaTile icon={Coffee} label={d.brewMethodLabel} value={brewMethodLabel} />
            <MetaTile icon={Scale} label={d.ratioLabel} value={recipe.ratio} />
            <MetaTile icon={Clock} label={d.brewTimeLabel} value={recipe.time} />
            <MetaTile icon={MapPin} label={d.roastLevelLabel} value={recipe.roastLevel} />
          </div>

          <CompatibleDevices hasXBloom={false} dictionary={dictionary} />

          {!recipe.premium && canAccessFull && (
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <RippleLink href="/recipes" className={`${buttons.secondary} w-full sm:w-auto`}>
                {d.browseMoreRecipes}
              </RippleLink>
              <RecipeConverterButton currentDevice={brewMethodLabel} sourceRecipe={{ brewTime: recipe.time }} />
            </div>
          )}
        </div>
      </div>

      {!canAccessFull && (
        <RecipePremiumPaywall dictionary={dictionary} isAuthenticated={isAuthenticated} recipeSlug={slug} />
      )}
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
    <SectionFrame id="recipe-detail" ariaLabelledBy="recipe-detail-heading" padding="compact">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />
      <Link
        href="/recipes"
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-stone-400 transition-colors duration-300 hover:text-amber-400/90"
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        {d.backToAllRecipes}
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative h-72 overflow-hidden rounded-[1.5rem] border border-white/[0.11] sm:h-96 lg:h-full lg:min-h-[26rem]">
          <OptimizedImage
            src={coverImage}
            alt={coverAlt}
            blurDataUrl={recipe.coverImageBlur}
            width={recipe.coverImageWidth ?? undefined}
            height={recipe.coverImageHeight ?? undefined}
            sizes={IMAGE_SIZE_PRESETS.recipeDetailCover}
            priority
            className="object-cover brightness-[0.9] contrast-[1.04] saturate-[0.94]"
          />
          <div className={cards.imageOverlay} />
          <div className={cards.imageAmberWash} />

          {!recipe.published && (
            <div className="absolute start-5 top-5 rounded-full border border-stone-500/40 bg-stone-900/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-300 backdrop-blur-xl">
              {d.draftBadge}
            </div>
          )}

          {recipe.premiumOnly && (
            <div className="absolute end-5 top-5 rounded-full border border-amber-700/35 bg-amber-950/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90 backdrop-blur-xl">
              {dictionary.common.premiumBadge}
            </div>
          )}

          {recipe.originLabel && (
            <div className="absolute bottom-5 start-5 flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#0a0705]/55 px-3 py-1 text-[10px] font-medium text-stone-200 backdrop-blur-xl">
              <MapPin className="h-3 w-3 text-amber-500/80" aria-hidden />
              {recipe.originLabel}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-600/70">
              {recipe.roasterName ?? d.communityRecipe}
            </p>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <Heart className="h-3.5 w-3.5 text-amber-500/70" aria-hidden />
                {favoritesCount}
              </span>
              {isAuthenticated && (
                <FavoriteButton recipeId={recipe.id} isFavorited={isFavorited} currentPath={`/recipes/${slug}`} />
              )}
            </div>
          </div>

          <h1
            id="recipe-detail-heading"
            className="mt-3 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-stone-50 sm:text-4xl"
          >
            {recipe.title}
          </h1>

          <div className="mt-4">
            <RecipeRatingBadge summary={ratingSummary} labels={dictionary.recipeReviews} />
          </div>

          <p className="mt-5 text-lg leading-[1.75] text-stone-400">{notes}</p>

          {recipe.difficulty && (
            <div className="mt-8">
              <DifficultyIndicator
                level={recipe.difficulty}
                label={translate(dictionary, difficultyLabelKey(recipe.difficulty))}
                labelClassName="text-sm text-stone-400"
                className="flex items-center gap-2.5"
              />
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MetaTile icon={Coffee} label={d.brewMethodLabel} value={recipe.brewingMethodName ?? d.customValue} />
            <MetaTile icon={Scale} label={d.ratioLabel} value={recipe.ratio ?? d.dashValue} />
            <MetaTile
              icon={Clock}
              label={d.brewTimeLabel}
              value={recipe.totalBrewTime ?? recipe.estimatedBrewTime ?? d.dashValue}
            />
            {recipe.roastLevel && <MetaTile icon={MapPin} label={d.roastLevelLabel} value={recipe.roastLevel} />}
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
      </div>

      {!canAccessFull && (
        <RecipePremiumPaywall dictionary={dictionary} isAuthenticated={isAuthenticated} recipeSlug={slug} />
      )}

      {canAccessFull && hasCoffeeInfo && (
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{d.coffeeSectionTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      )}

      {canAccessFull && (
        <>
          <div className="mt-12">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{d.brewingDetailsTitle}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>

          {recipe.pours.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{d.pourStructureTitle}</h2>
              <ol className="mt-4 space-y-3">
                {recipe.pours.map((pour) => (
                  <li
                    key={pour.id}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3"
                  >
                    <span className="text-sm font-medium text-amber-400/90">
                      {d.pourPrefix} {pour.pour_number}
                    </span>
                    {pour.water_amount !== null && <span className="text-sm text-stone-300">{pour.water_amount}g</span>}
                    {pour.time_label && (
                      <span className="text-sm text-stone-500">
                        {d.atTimeLabel} {pour.time_label}
                      </span>
                    )}
                    {pour.notes && <span className="text-sm text-stone-500">— {pour.notes}</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {hasResults && (
            <div className="mt-12">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{d.resultsTitle}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            </div>
          )}

          {recipe.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1 text-xs font-medium text-stone-300"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {recipe.instructions && (
            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">{dictionary.recipes.instructions}</p>
              <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-stone-300">{recipe.instructions}</p>
            </div>
          )}

          {recipe.images.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{d.galleryTitle}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            </div>
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

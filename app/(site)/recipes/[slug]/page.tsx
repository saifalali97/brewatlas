import type { Metadata } from "next";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import { notFound } from "next/navigation";
import { PlaceholderRecipeDetailView } from "@/app/components/recipes/placeholder-recipe-detail-view";
import { getGulfRecipeDetailForPage } from "@/lib/gulf-directory/placeholder-recipe-detail";
import {
  Calendar,
  Clock,
  Coffee,
  Cpu,
  Droplets,
  FlaskConical,
  Hand,
  Heart,
  Leaf,
  MapPin,
  Mountain,
  Percent,
  Scale,
  Sprout,
  Users,
} from "lucide-react";
import { PersonalizedDbBrew } from "@/app/components/recipes/personalization/personalized-db-brew";
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
import { getCachedPublishedDbRecipes } from "@/lib/data/cached-public-data";
import { getDbRecipeDetailBySlug, getFavoritesCount, getUserFavoriteRecipeIds } from "@/lib/data/db-recipes";
import { recipeHasXBloomProfile } from "@/lib/data/xbloom";
import { difficultyLabelKey } from "@/lib/i18n/home-labels";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { translate, interpolate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/types";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { resolveSitePathname } from "@/lib/seo/path-utils";
import { buildRecipeReviewJsonLd } from "@/lib/seo/recipe-review-json-ld";
import { RecipeTextExtrasSections } from "@/app/components/recipes/recipe-guide-sections";
import {
  RecipeDetailActionBar,
  RecipeFlavorNotesPanel,
  RecipeHeroFactLine,
  RecipeProseContent,
  recipeDetailSectionSpacing,
} from "@/app/components/recipes/recipe-detail-ui";
import { getRecipeTranslation, localizeRecipe } from "@/lib/data/translations";
import { RecipeReviewsPanel } from "@/lib/dynamic-sections";
import { RecipeRatingBadge } from "@/app/components/reviews/recipe-rating-badge";
import {
  getRecipeRatingDistribution,
  getRecipeRatingSummary,
  getRecipeReviewsPage,
  getUserRecipeReview,
  parseReviewSort,
  getRecipeLikeCount,
} from "@/lib/data/community";
import { isRecipePubliclyVisible } from "@/lib/recipes/recipe-status";
import { canAccessFullRecipeContent } from "@/lib/membership/premium";
import { recordRecipeView } from "@/lib/data/recipe-analytics";
import { getMembershipSummary } from "@/lib/data/membership";
import { createClient } from "@/lib/supabase/server";
import { getBrewSessionRecipeStats } from "@/lib/data/brew-sessions";
import { getUserBrewingSetup } from "@/lib/data/brewing-setup";
import { evaluateRecipeSetupCompatibility } from "@/lib/recipes/setup-compatibility";
import { BrewSessionRecipePanel } from "@/app/components/recipes/brew-session-recipe-panel";
import { RecipeSetupCompatibilityPanel } from "@/app/components/recipes/recipe-setup-compatibility";
import { OfficialRecipeDetailPanel } from "@/app/components/recipes/official-recipe-detail-panel";
import { LikeButton } from "@/app/components/recipes/like-button";
import { RecipeCommentsPanel } from "@/app/components/community/recipe-comments-panel";
import { getRecipeComments, hasUserLikedRecipe } from "@/lib/data/community-platform";
import type { RecipeSetupCompatibility } from "@/types/brewing-setup";
import type { BrewSessionRecipeStats } from "@/types/brew-sessions";
import { RecipePremiumPaywall } from "@/app/components/recipes/recipe-premium-paywall";
import { RECIPE_IMAGE_PLACEHOLDER, type RecipeFullDetail } from "@/types/recipe";
import type {
  RatingDistributionBucket,
  RecipeRatingSummary,
  RecipeReview,
  RecipeReviewsResult,
} from "@/types/community";
import type { RecipeComment, RecipeCommentSort } from "@/types/community-platform";

function parseCommentSort(value: string | undefined): RecipeCommentSort {
  if (value === "oldest" || value === "top") return value;
  return "newest";
}

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
  searchParams: Promise<{
    reviewSort?: string;
    reviewPage?: string;
    commentSort?: string;
  }>;
};

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  const placeholderDetail = await getGulfRecipeDetailForPage(slug);
  if (placeholderDetail) {
    return buildLocalizedMetadata({
      pathname: `/recipes/${slug}`,
      locale,
      title: placeholderDetail.name,
      description: placeholderDetail.lead,
      ogImage: { url: placeholderDetail.image, alt: placeholderDetail.name },
      noIndex: true,
    });
  }

  const supabase = await createClient();
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
  const commentSort = parseCommentSort(resolvedSearchParams.commentSort);
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  const placeholderDetail = await getGulfRecipeDetailForPage(slug);
  if (placeholderDetail) {
    const countryName =
      dictionary.recipesDirectory.countries[placeholderDetail.countrySlug]?.name ??
      placeholderDetail.countrySlug;
    const difficultyLabel =
      dictionary.homeDifficulty[
        placeholderDetail.difficulty === "Advanced"
          ? "advanced"
          : placeholderDetail.difficulty === "Intermediate"
            ? "intermediate"
            : "beginner"
      ];
    const brewMethodKey =
      placeholderDetail.brewMethod === "V60"
        ? "v60"
        : placeholderDetail.brewMethod === "Espresso"
          ? "espresso"
          : placeholderDetail.brewMethod === "Cold Brew"
            ? "coldBrew"
            : placeholderDetail.brewMethod === "Chemex"
              ? "chemex"
              : placeholderDetail.brewMethod === "Aeropress"
                ? "aeropress"
                : placeholderDetail.brewMethod === "Moka Pot"
                  ? "mokaPot"
                  : null;
    return (
      <PlaceholderRecipeDetailView
        recipe={placeholderDetail}
        dictionary={dictionary}
        countryName={countryName}
        difficultyLabel={difficultyLabel}
        brewMethodLabel={
          brewMethodKey ? dictionary.homeFilters[brewMethodKey] : placeholderDetail.brewMethod
        }
      />
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

  const [favoritesCount, favoriteIds, hasXBloomProfile, ratingSummary, ratingDistribution, reviewsResult, userReview, membership, guestRecipeIndex, userSetup, brewSessionStats, likeCount, isLiked, comments] =
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
            const dbRecipes = await getCachedPublishedDbRecipes(locale);
            return dbRecipes.findIndex((entry) => entry.slug === slug);
          })(),
      viewerId ? getUserBrewingSetup(supabase, viewerId) : Promise.resolve(null),
      viewerId ? getBrewSessionRecipeStats(supabase, viewerId, recipe.id) : Promise.resolve(null),
      getRecipeLikeCount(supabase, recipe.id),
      viewerId ? hasUserLikedRecipe(supabase, viewerId, recipe.id) : Promise.resolve(false),
      getRecipeComments(supabase, recipe.id, { sort: commentSort, viewerId }),
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
    <>
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
        brewSessionStats={brewSessionStats}
        likeCount={likeCount}
        isLiked={isLiked}
        comments={comments}
        commentSort={commentSort}
      />
    </>
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
  brewSessionStats: BrewSessionRecipeStats | null;
  likeCount: number;
  isLiked: boolean;
  comments: RecipeComment[];
  commentSort: RecipeCommentSort;
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
  brewSessionStats,
  likeCount,
  isLiked,
  comments,
  commentSort,
}: DbRecipeViewProps) {
  const d = dictionary.recipeDetail;
  const coverImage = recipe.coverImageUrl ?? RECIPE_IMAGE_PLACEHOLDER;
  const coverAlt = recipe.coverImageAlt ?? d.recipeCoverAltTemplate.replace("{title}", recipe.title);
  const notes = recipe.tastingNotes ?? recipe.description ?? d.noTastingNotes;
  const brewMethodLabel = recipe.brewingMethodName ?? d.customValue;
  const brewTimeDisplay = recipe.totalBrewTime ?? recipe.estimatedBrewTime ?? null;
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
        facts={
          <RecipeHeroFactLine
            items={[
              brewMethodLabel,
              recipe.ratio ?? undefined,
              brewTimeDisplay ?? undefined,
              recipe.roastLevel ?? undefined,
            ]}
          />
        }
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
            <RecipeRatingBadge summary={ratingSummary} labels={dictionary.recipeReviews} />
            <span className={`${acTypography.folioMeta} flex items-center gap-1.5 text-ac-espresso/70`}>
              <Heart className="h-3.5 w-3.5 text-ac-copper" aria-hidden />
              {favoritesCount}
            </span>
            {isAuthenticated ? (
              <>
                <LikeButton
                  recipeId={recipe.id}
                  isLiked={isLiked}
                  likeCount={likeCount}
                  currentPath={`/recipes/${slug}${commentSort !== "newest" ? `?commentSort=${commentSort}` : ""}`}
                />
                <FavoriteButton recipeId={recipe.id} isFavorited={isFavorited} currentPath={`/recipes/${slug}`} />
              </>
            ) : (
              <span className={`${acTypography.folioMeta} flex items-center gap-1.5 tabular-nums text-ac-espresso/70`}>
                <Heart className="h-3.5 w-3.5 text-ac-copper" aria-hidden />
                {likeCount}
              </span>
            )}
          </div>
        }
      />

      <div className="mx-auto max-w-3xl">
        {recipe.difficulty ? (
          <div className="mt-8 md:mt-10">
            <DifficultyIndicator
              level={recipe.difficulty}
              label={translate(dictionary, difficultyLabelKey(recipe.difficulty))}
              labelClassName={`${acTypography.folioMeta} text-sm text-ac-espresso/70`}
              className="flex items-center gap-2.5"
            />
          </div>
        ) : null}

        {canAccessFull ? (
          <>
            <PersonalizedDbBrew
              recipe={recipe}
              labels={{
                servingStyleLabel: dictionary.recipePersonalization.servingStyleLabel,
                hotOption: dictionary.recipePersonalization.hotOption,
                icedOption: dictionary.recipePersonalization.icedOption,
                officialBadge: dictionary.recipePersonalization.officialBadge,
                personalizedBadge: dictionary.recipePersonalization.personalizedBadge,
                roasterRecommendedBadge: dictionary.recipePersonalization.roasterRecommendedBadge,
                resetCta: dictionary.recipePersonalization.resetCta,
                brewMethodLabel: dictionary.recipePersonalization.brewMethodLabel,
                coffeeDoseLabel: dictionary.recipePersonalization.coffeeDoseLabel,
                brewRatioLabel: dictionary.recipePersonalization.brewRatioLabel,
                customValue: dictionary.recipePersonalization.customValue,
                guidanceTitle: dictionary.recipePersonalization.guidanceTitle,
                saveMyRecipeCta: dictionary.recipePersonalization.saveMyRecipeCta,
                duplicateRecipeCta: dictionary.recipePersonalization.duplicateRecipeCta,
                shareRecipeCta: dictionary.recipePersonalization.shareRecipeCta,
                resetToRoasterCta: dictionary.recipePersonalization.resetToRoasterCta,
              }}
              copy={{
                hotWaterLabel: dictionary.recipePersonalization.hotWaterLabel,
                iceLabel: d.iceLabel,
                iceEquipmentName: dictionary.recipePersonalization.iceEquipmentName,
                iceEquipmentDetailTemplate: dictionary.recipePersonalization.iceEquipmentDetailTemplate,
                flashPrepNotesTemplate: dictionary.recipePersonalization.flashPrepNotesTemplate,
                flashSwirlNotes: dictionary.recipePersonalization.flashSwirlNotes,
                flashTipScale: dictionary.recipePersonalization.flashTipScale,
                flashTipChill: dictionary.recipePersonalization.flashTipChill,
                flashExtractionNote: dictionary.recipePersonalization.flashExtractionNote,
                hotTipRestore: dictionary.recipePersonalization.hotTipRestore,
                hotExtractionNote: dictionary.recipePersonalization.hotExtractionNote,
              }}
              detailLabels={{
                brewingDetailsTitle: d.brewingDetailsTitle,
                coffeeDoseLabel: d.coffeeDoseLabel,
                waterLabel: d.waterLabel,
                grindSizeLabel: d.grindSizeLabel,
                waterTempLabel: d.waterTempLabel,
                brewTimeLabel: d.brewTimeLabel,
                ratioLabel: d.ratioLabel,
                deviceLabel: d.deviceLabel,
                grinderLabel: d.grinderLabel,
                filterLabel: d.filterLabel,
                waterRecipeLabel: d.waterRecipeLabel,
                bloomLabel: d.bloomLabel,
                iceLabel: d.iceLabel,
                pourStructureTitle: d.pourStructureTitle,
                pourPrefix: d.pourPrefix,
                atTimeLabel: d.atTimeLabel,
                tipsTitle: dictionary.recipePersonalization.tipsTitle,
                extractionTitle: dictionary.recipePersonalization.extractionTitle,
              }}
            />
            <RecipeFlavorNotesPanel title={d.flavorNotesTitle} notes={notes} />
          </>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
            <MetaTile icon={Coffee} label={d.brewMethodLabel} value={brewMethodLabel} />
            <MetaTile icon={Scale} label={d.ratioLabel} value={recipe.ratio ?? d.dashValue} />
            <MetaTile icon={Clock} label={d.brewTimeLabel} value={brewTimeDisplay ?? d.dashValue} />
            {recipe.roastLevel ? (
              <MetaTile icon={MapPin} label={d.roastLevelLabel} value={recipe.roastLevel} />
            ) : null}
          </div>
        )}

        <CompatibleDevices hasXBloom={hasXBloomProfile} dictionary={dictionary} />

        {(isOwner || canAccessFull) ? (
          <RecipeDetailActionBar
            primary={
              <>
                {isOwner ? (
                  <>
                    <RippleLink
                      href={`/account/recipes/${recipe.id}/edit`}
                      className={`${buttons.primary} w-full sm:w-auto`}
                    >
                      {dictionary.recipes.editRecipe}
                    </RippleLink>
                    <DeleteRecipeButton recipeId={recipe.id} recipeTitle={recipe.title} />
                  </>
                ) : (
                  <RippleLink href="/recipes" className={`${buttons.primary} w-full sm:w-auto`}>
                    {d.browseMoreRecipes}
                  </RippleLink>
                )}
              </>
            }
            secondary={
              canAccessFull ? (
                <>
                  {recipe.videoUrl && !isOwner ? (
                    <a
                      href={recipe.videoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`${buttons.secondary} w-full sm:w-auto`}
                    >
                      {d.watchVideo}
                    </a>
                  ) : null}
                  <RecipeConverterButton
                    currentDevice={recipe.deviceName ?? recipe.brewingMethodName ?? d.dashValue}
                    sourceRecipe={{
                      doseG: recipe.coffeeDose,
                      waterG: recipe.waterAmount,
                      grindSize: recipe.grindSize,
                      temperatureC: recipe.waterTemperature,
                      bloomAmountG: recipe.bloomAmount,
                      bloomTime: recipe.bloomTime,
                      brewTime: brewTimeDisplay,
                      poursCount: recipe.pours.length > 0 ? recipe.pours.length : null,
                    }}
                  />
                </>
              ) : null
            }
          />
        ) : null}
      </div>

      {!canAccessFull && (
        <RecipePremiumPaywall dictionary={dictionary} isAuthenticated={isAuthenticated} recipeSlug={slug} />
      )}

      {canAccessFull && hasCoffeeInfo && (
        <RecipeEditorialSection title={d.coffeeSectionTitle} className={recipeDetailSectionSpacing}>
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
          {hasResults && (
            <RecipeEditorialSection title={d.resultsTitle} className={recipeDetailSectionSpacing}>
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
          {viewerId && brewSessionStats ? (
            <BrewSessionRecipePanel
              recipeSlug={slug}
              stats={brewSessionStats}
              compatibility={setupCompatibility}
              labels={{
                title: dictionary.brewSessionsPage.compatibilityTitle,
                sessionCountTemplate: dictionary.brewSessionsPage.sessionCountTemplate,
                averageRatingLabel: dictionary.brewSessionsPage.averageRatingLabel,
                mostRecentBrewLabel: dictionary.brewSessionsPage.mostRecentBrewLabel,
                personalNotesLabel: dictionary.brewSessionsPage.personalNotesLabel,
                previousBrewsTitle: dictionary.brewSessionsPage.previousBrewsTitle,
                compatibilityTitle: dictionary.brewSessionsPage.compatibilityTitle,
                viewCta: dictionary.brewSessionsPage.viewCta,
                ratingOutOfFive: dictionary.brewSessionsPage.ratingOutOfFive,
                notSet: dictionary.brewSessionsPage.notSetOption,
              }}
            />
          ) : null}

          {recipe.instructions && (
            <RecipeEditorialSection title={dictionary.recipes.instructions} className={recipeDetailSectionSpacing}>
              <RecipeProseContent>
                <p className="whitespace-pre-line">{recipe.instructions}</p>
              </RecipeProseContent>
            </RecipeEditorialSection>
          )}

          <RecipeTextExtrasSections
            dictionary={dictionary}
            brewNotes={recipe.brewNotes}
            tips={recipe.tips}
            warnings={recipe.warnings}
          />

          {recipe.images.length > 0 && (
            <RecipeEditorialSection title={d.galleryTitle} className={recipeDetailSectionSpacing}>
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

      <RecipeCommentsPanel
        recipeId={recipe.id}
        currentPath={`/recipes/${slug}${commentSort !== "newest" ? `?commentSort=${commentSort}` : ""}`}
        comments={comments}
        viewerId={viewerId}
        sort={commentSort}
      />
    </SectionFrame>
  );
}

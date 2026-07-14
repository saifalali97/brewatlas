import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
import { getAllRecipeSlugs, getStaticRecipeIndexBySlug } from "@/lib/data/recipes";
import { getDbRecipeDetailBySlug, getFavoritesCount, getUserFavoriteRecipeIds } from "@/lib/data/db-recipes";
import { recipeHasXBloomProfile } from "@/lib/data/xbloom";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { translate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/types";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import { RECIPE_IMAGE_PLACEHOLDER, type RecipeFullDetail } from "@/types/recipe";
import type { FeaturedRecipe } from "@/types/homepage";

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
  const dbRecipe = await getDbRecipeDetailBySlug(supabase, slug);

  if (!dbRecipe) {
    const dictionary = await getDictionary(locale);
    return { title: dictionary.metadata.recipeNotFoundTitle };
  }

  const description = dbRecipe.tastingNotes ?? dbRecipe.description ?? undefined;

  return {
    title: dbRecipe.title,
    description,
    // Draft recipes are only ever visible to their author or an admin
    // (enforced by RLS), so they're excluded from search indexing.
    robots: dbRecipe.published ? undefined : { index: false, follow: false },
    alternates: { canonical: `/recipes/${slug}` },
    openGraph: {
      title: dbRecipe.title,
      description,
      images: dbRecipe.coverImageUrl ? [dbRecipe.coverImageUrl] : undefined,
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const staticIndex = getStaticRecipeIndexBySlug(slug);

  if (staticIndex !== -1) {
    const content = await getHomeContent(locale);
    return <StaticRecipeView recipe={content.featuredRecipes[staticIndex]} dictionary={dictionary} />;
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const recipe = await getDbRecipeDetailBySlug(supabase, slug);

  if (!recipe) {
    notFound();
  }

  const [favoritesCount, favoriteIds, hasXBloomProfile] = await Promise.all([
    getFavoritesCount(supabase, recipe.id),
    authData.user ? getUserFavoriteRecipeIds(supabase, authData.user.id) : Promise.resolve(new Set<string>()),
    recipeHasXBloomProfile(supabase, recipe.id),
  ]);

  const isOwner = Boolean(authData.user && recipe.authorId === authData.user.id);

  return (
    <DbRecipeView
      recipe={recipe}
      slug={slug}
      favoritesCount={favoritesCount}
      isFavorited={favoriteIds.has(recipe.id)}
      isOwner={isOwner}
      isAuthenticated={Boolean(authData.user)}
      hasXBloomProfile={hasXBloomProfile}
      dictionary={dictionary}
    />
  );
}

function StaticRecipeView({ recipe, dictionary }: { recipe: FeaturedRecipe; dictionary: Dictionary }) {
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
          <Image
            src={recipe.image}
            alt={`${recipe.name} ${recipe.country} ${recipe.brewMethod} ${recipe.roastLevel}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
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

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <RippleLink href="/premium" className={`${buttons.primary} w-full sm:w-auto`}>
              {d.unlockFullGuide}
            </RippleLink>
            <RippleLink href="/recipes" className={`${buttons.secondary} w-full sm:w-auto`}>
              {d.browseMoreRecipes}
            </RippleLink>
            <RecipeConverterButton currentDevice={brewMethodLabel} />
          </div>
        </div>
      </div>
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
  hasXBloomProfile: boolean;
  dictionary: Dictionary;
};

function DbRecipeView({
  recipe,
  slug,
  favoritesCount,
  isFavorited,
  isOwner,
  isAuthenticated,
  hasXBloomProfile,
  dictionary,
}: DbRecipeViewProps) {
  const d = dictionary.recipeDetail;
  const coverImage = recipe.coverImageUrl ?? RECIPE_IMAGE_PLACEHOLDER;
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
      <Link
        href="/recipes"
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-stone-400 transition-colors duration-300 hover:text-amber-400/90"
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        {d.backToAllRecipes}
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative h-72 overflow-hidden rounded-[1.5rem] border border-white/[0.11] sm:h-96 lg:h-full lg:min-h-[26rem]">
          <Image
            src={coverImage}
            alt={d.recipeCoverAltTemplate.replace("{title}", recipe.title)}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
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
                <RippleLink href={`/dashboard/recipes/${recipe.id}/edit`} className={`${buttons.primary} w-full sm:w-auto`}>
                  {dictionary.recipes.editRecipe}
                </RippleLink>
                <DeleteRecipeButton recipeId={recipe.id} recipeTitle={recipe.title} />
              </>
            ) : (
              <RippleLink href="/premium" className={`${buttons.primary} w-full sm:w-auto`}>
                {d.unlockFullGuide}
              </RippleLink>
            )}
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
            <RecipeConverterButton currentDevice={recipe.deviceName ?? recipe.brewingMethodName ?? d.dashValue} />
          </div>
        </div>
      </div>

      {hasCoffeeInfo && (
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
                <Image
                  src={image.url}
                  alt={d.additionalPhotoAltTemplate.replace("{title}", recipe.title)}
                  fill
                  sizes="33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionFrame>
  );
}

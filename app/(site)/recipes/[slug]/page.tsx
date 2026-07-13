import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Coffee,
  Droplets,
  Filter,
  FlaskConical,
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
import { DeleteRecipeButton } from "@/app/components/recipes/delete-recipe-button";
import { FavoriteButton } from "@/app/components/recipes/favorite-button";
import { cards, buttons } from "@/lib/constants/styles";
import { getAllRecipeSlugs, getRecipeBySlug } from "@/lib/data/recipes";
import { getDbRecipeDetailBySlug, getFavoritesCount, getUserFavoriteRecipeIds } from "@/lib/data/db-recipes";
import { imageAlt } from "@/lib/seo/image-alt";
import { createClient } from "@/lib/supabase/server";
import { RECIPE_IMAGE_PLACEHOLDER, type RecipeFullDetail } from "@/types/recipe";

type RecipePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllRecipeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const staticRecipe = getRecipeBySlug(slug);

  if (staticRecipe) {
    return {
      title: staticRecipe.name,
      description: staticRecipe.notes,
      alternates: { canonical: `/recipes/${slug}` },
      openGraph: {
        title: staticRecipe.name,
        description: staticRecipe.notes,
        images: [staticRecipe.image],
      },
    };
  }

  const supabase = await createClient();
  const dbRecipe = await getDbRecipeDetailBySlug(supabase, slug);

  if (!dbRecipe) {
    return { title: "Recipe Not Found" };
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
  const staticRecipe = getRecipeBySlug(slug);

  if (staticRecipe) {
    return <StaticRecipeView recipe={staticRecipe} />;
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const recipe = await getDbRecipeDetailBySlug(supabase, slug);

  if (!recipe) {
    notFound();
  }

  const [favoritesCount, favoriteIds] = await Promise.all([
    getFavoritesCount(supabase, recipe.id),
    authData.user ? getUserFavoriteRecipeIds(supabase, authData.user.id) : Promise.resolve(new Set<string>()),
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
    />
  );
}

type StaticRecipe = NonNullable<ReturnType<typeof getRecipeBySlug>>;

function StaticRecipeView({ recipe }: { recipe: StaticRecipe }) {
  return (
    <SectionFrame id="recipe-detail" ariaLabelledBy="recipe-detail-heading" padding="compact">
      <Link
        href="/recipes"
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-stone-400 transition-colors duration-300 hover:text-amber-400/90"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to all recipes
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative h-72 overflow-hidden rounded-[1.5rem] border border-white/[0.11] sm:h-96 lg:h-full lg:min-h-[26rem]">
          <Image
            src={recipe.image}
            alt={imageAlt.recipe(recipe.name, recipe.country, recipe.brewMethod, recipe.roastLevel)}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover brightness-[0.9] contrast-[1.04] saturate-[0.94]"
          />
          <div className={cards.imageOverlay} />
          <div className={cards.imageAmberWash} />

          {recipe.premium && (
            <div className="absolute right-5 top-5 rounded-full border border-amber-700/35 bg-amber-950/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90 backdrop-blur-xl">
              Premium
            </div>
          )}

          <div className="absolute bottom-5 left-5 flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#0a0705]/55 px-3 py-1 text-[10px] font-medium text-stone-200 backdrop-blur-xl">
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
              labelClassName="text-sm text-stone-400"
              className="flex items-center gap-2.5"
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MetaTile icon={Coffee} label="Brew Method" value={recipe.brewMethod} />
            <MetaTile icon={Scale} label="Ratio" value={recipe.ratio} />
            <MetaTile icon={Clock} label="Brew Time" value={recipe.time} />
            <MetaTile icon={MapPin} label="Roast Level" value={recipe.roastLevel} />
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <RippleLink href="/premium" className={`${buttons.primary} w-full sm:w-auto`}>
              Unlock Full Guide
            </RippleLink>
            <RippleLink href="/recipes" className={`${buttons.secondary} w-full sm:w-auto`}>
              Browse More Recipes
            </RippleLink>
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
};

function DbRecipeView({ recipe, slug, favoritesCount, isFavorited, isOwner, isAuthenticated }: DbRecipeViewProps) {
  const coverImage = recipe.coverImageUrl ?? RECIPE_IMAGE_PLACEHOLDER;
  const notes = recipe.tastingNotes ?? recipe.description ?? "No tasting notes yet.";
  const ratings = [
    { label: "Sweetness", value: recipe.sweetness },
    { label: "Acidity", value: recipe.acidity },
    { label: "Body", value: recipe.body },
    { label: "Bitterness", value: recipe.bitterness },
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
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to all recipes
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative h-72 overflow-hidden rounded-[1.5rem] border border-white/[0.11] sm:h-96 lg:h-full lg:min-h-[26rem]">
          <Image
            src={coverImage}
            alt={`${recipe.title} coffee recipe`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover brightness-[0.9] contrast-[1.04] saturate-[0.94]"
          />
          <div className={cards.imageOverlay} />
          <div className={cards.imageAmberWash} />

          {!recipe.published && (
            <div className="absolute left-5 top-5 rounded-full border border-stone-500/40 bg-stone-900/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-300 backdrop-blur-xl">
              Draft
            </div>
          )}

          {recipe.premiumOnly && (
            <div className="absolute right-5 top-5 rounded-full border border-amber-700/35 bg-amber-950/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90 backdrop-blur-xl">
              Premium
            </div>
          )}

          {recipe.originLabel && (
            <div className="absolute bottom-5 left-5 flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#0a0705]/55 px-3 py-1 text-[10px] font-medium text-stone-200 backdrop-blur-xl">
              <MapPin className="h-3 w-3 text-amber-500/80" aria-hidden />
              {recipe.originLabel}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-600/70">
              {recipe.roasterName ?? "Community Recipe"}
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
                labelClassName="text-sm text-stone-400"
                className="flex items-center gap-2.5"
              />
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MetaTile icon={Coffee} label="Brew Method" value={recipe.brewingMethodName ?? "Custom"} />
            <MetaTile icon={Scale} label="Ratio" value={recipe.ratio ?? "—"} />
            <MetaTile icon={Clock} label="Brew Time" value={recipe.totalBrewTime ?? recipe.estimatedBrewTime ?? "—"} />
            {recipe.roastLevel && <MetaTile icon={MapPin} label="Roast Level" value={recipe.roastLevel} />}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {isOwner ? (
              <>
                <RippleLink href={`/dashboard/recipes/${recipe.id}/edit`} className={`${buttons.primary} w-full sm:w-auto`}>
                  Edit Recipe
                </RippleLink>
                <DeleteRecipeButton recipeId={recipe.id} recipeTitle={recipe.title} />
              </>
            ) : (
              <RippleLink href="/premium" className={`${buttons.primary} w-full sm:w-auto`}>
                Unlock Full Guide
              </RippleLink>
            )}
            <RippleLink href="/recipes" className={`${buttons.secondary} w-full sm:w-auto`}>
              Browse More Recipes
            </RippleLink>
            {recipe.videoUrl && (
              <a
                href={recipe.videoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={`${buttons.secondary} w-full sm:w-auto`}
              >
                Watch Video
              </a>
            )}
          </div>
        </div>
      </div>

      {hasCoffeeInfo && (
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Coffee</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recipe.coffeeName && <MetaTile icon={Coffee} label="Coffee" value={recipe.coffeeName} />}
            {recipe.farm && <MetaTile icon={Sprout} label="Farm" value={recipe.farm} />}
            {recipe.producer && <MetaTile icon={Users} label="Producer" value={recipe.producer} />}
            {recipe.variety && <MetaTile icon={Leaf} label="Variety" value={recipe.variety} />}
            {recipe.process && <MetaTile icon={Droplets} label="Process" value={recipe.process} />}
            {recipe.altitude && <MetaTile icon={Mountain} label="Altitude" value={recipe.altitude} />}
            {recipe.roastDate && <MetaTile icon={Calendar} label="Roast Date" value={recipe.roastDate} />}
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Brewing Details</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recipe.deviceName && <MetaTile icon={Settings2} label="Device" value={recipe.deviceName} />}
          {recipe.grinderName && <MetaTile icon={Settings2} label="Grinder" value={recipe.grinderName} />}
          {recipe.grindSize && <MetaTile icon={Settings2} label="Grind Size" value={recipe.grindSize} />}
          {recipe.filterTypeName && <MetaTile icon={Filter} label="Filter" value={recipe.filterTypeName} />}
          {recipe.waterProfileName && <MetaTile icon={Droplets} label="Water Recipe" value={recipe.waterProfileName} />}
          {recipe.waterTemperature !== null && (
            <MetaTile icon={Thermometer} label="Water Temp" value={`${recipe.waterTemperature}°C`} />
          )}
          {recipe.coffeeDose !== null && <MetaTile icon={Scale} label="Coffee Dose" value={`${recipe.coffeeDose}g`} />}
          {recipe.waterAmount !== null && <MetaTile icon={Droplets} label="Water" value={`${recipe.waterAmount}g`} />}
          {recipe.bloomAmount !== null && (
            <MetaTile icon={Droplets} label="Bloom" value={`${recipe.bloomAmount}g${recipe.bloomTime ? ` / ${recipe.bloomTime}` : ""}`} />
          )}
          {recipe.iceAmount !== null && recipe.iceAmount > 0 && (
            <MetaTile icon={Snowflake} label="Ice" value={`${recipe.iceAmount}g`} />
          )}
        </div>
      </div>

      {recipe.pours.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Pour Structure</h2>
          <ol className="mt-4 space-y-3">
            {recipe.pours.map((pour) => (
              <li
                key={pour.id}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3"
              >
                <span className="text-sm font-medium text-amber-400/90">Pour {pour.pour_number}</span>
                {pour.water_amount !== null && <span className="text-sm text-stone-300">{pour.water_amount}g</span>}
                {pour.time_label && <span className="text-sm text-stone-500">at {pour.time_label}</span>}
                {pour.notes && <span className="text-sm text-stone-500">— {pour.notes}</span>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {hasResults && (
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Results</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recipe.beverageWeight !== null && (
              <MetaTile icon={Scale} label="Beverage Weight" value={`${recipe.beverageWeight}g`} />
            )}
            {recipe.tds !== null && <MetaTile icon={FlaskConical} label="TDS" value={`${recipe.tds}%`} />}
            {recipe.extractionPercentage !== null && (
              <MetaTile icon={Percent} label="Extraction" value={`${recipe.extractionPercentage}%`} />
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
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Instructions</p>
          <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-stone-300">{recipe.instructions}</p>
        </div>
      )}

      {recipe.images.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Gallery</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipe.images.map((image) => (
              <div key={image.id} className="relative h-48 overflow-hidden rounded-xl border border-white/[0.1]">
                <Image src={image.url} alt={`${recipe.title} additional photo`} fill sizes="33vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionFrame>
  );
}

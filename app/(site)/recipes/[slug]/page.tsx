import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Coffee, MapPin, Scale } from "lucide-react";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { cards, buttons } from "@/lib/constants/styles";
import { getAllRecipeSlugs, getRecipeBySlug } from "@/lib/data/recipes";
import { imageAlt } from "@/lib/seo/image-alt";

type RecipePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllRecipeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    return { title: "Recipe Not Found" };
  }

  return {
    title: recipe.name,
    description: recipe.notes,
    alternates: {
      canonical: `/recipes/${slug}`,
    },
    openGraph: {
      title: recipe.name,
      description: recipe.notes,
      images: [recipe.image],
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

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
        <div className={`relative h-72 overflow-hidden rounded-[1.5rem] border border-white/[0.11] sm:h-96 lg:h-full lg:min-h-[26rem]`}>
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
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-600/70">
            {recipe.country}
          </p>
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

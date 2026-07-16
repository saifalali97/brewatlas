"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { RevealOnScroll } from "@/app/components/ui/reveal-on-scroll";
import { dsFocus, dsMotion, dsTypography } from "@/lib/constants/styles";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { interpolate } from "@/lib/i18n/format";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { FeaturedRecipe } from "@/types/homepage";

type FeaturedRecipeItem = {
  recipe: FeaturedRecipe;
  slug: string;
};

type FeaturedRecipesSectionProps = {
  items: FeaturedRecipeItem[];
  btnSecondary: string;
};

/** Magazine editorial — hero feature + typographic index, not a card rail. */
export function FeaturedRecipesSection({ items, btnSecondary }: FeaturedRecipesSectionProps) {
  const { t } = useTranslations();
  const [hero, ...rest] = items;

  if (!hero) {
    return null;
  }

  const heroLabels = {
    difficultyLabel: t(difficultyLabelKey(hero.recipe.difficulty)),
    brewMethodLabel: (() => {
      const key = brewMethodLabelKey(hero.recipe.brewMethod);
      return key ? t(key) : hero.recipe.brewMethod;
    })(),
    imageAlt: interpolate(t("homeFeaturedRecipes.imageAltTemplate"), {
      name: hero.recipe.name,
      country: hero.recipe.country,
      brewMethod: hero.recipe.brewMethod,
      roastLevel: hero.recipe.roastLevel,
    }),
  };

  return (
    <section id="recipes" aria-labelledby="recipes-heading" className="bg-ba-ivory">
      <div className="mx-auto max-w-7xl px-6 py-32 sm:px-8 md:py-40 lg:px-12 lg:py-48 xl:px-16">
        <RevealOnScroll>
          <p className={dsTypography.eyebrow}>{t("homeFeaturedRecipes.eyebrow")}</p>
          <h2 id="recipes-heading" className={`mt-6 max-w-2xl ${dsTypography.h1}`}>
            {t("homeFeaturedRecipes.title")}
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <Link
            href={`/recipes/${hero.slug}`}
            className={`group mt-16 grid overflow-hidden rounded-[2rem] bg-ba-espresso lg:grid-cols-12 lg:min-h-[34rem] ${dsFocus.ring}`}
          >
            <div className="relative min-h-[22rem] lg:col-span-7 lg:min-h-full">
              <Image
                src={hero.recipe.image}
                alt={heroLabels.imageAlt}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className={`object-cover ${dsMotion.transitionSlow} motion-safe:group-hover:scale-[1.03]`}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ba-espresso/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-ba-espresso/20" />
              {hero.recipe.featured && (
                <span className="absolute start-6 top-6 rounded-full border border-ba-gold/35 bg-ba-gold/15 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ba-gold">
                  {t("homeFeaturedRecipes.editorsChoice")}
                </span>
              )}
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-5 lg:p-14 xl:p-16">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-ba-gold/85">
                {hero.recipe.country}
              </p>
              <h3 className="font-display mt-4 text-3xl leading-[1.08] tracking-[-0.03em] text-ba-pearl sm:text-4xl lg:text-[2.75rem]">
                {hero.recipe.name}
              </h3>
              <p className="mt-3 text-sm text-ba-sand-deep/75">{hero.recipe.origin}</p>
              <p className="mt-6 text-base leading-[1.75] text-ba-sand-deep/85">{hero.recipe.notes}</p>

              <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/[0.08] pt-8 text-sm text-ba-sand-deep/70">
                <DifficultyIndicator
                  level={hero.recipe.difficulty}
                  label={heroLabels.difficultyLabel}
                  labelClassName="text-sm text-ba-sand-deep/65"
                />
                <span>
                  {t("homeFeaturedRecipes.ratioLabel")}{" "}
                  <strong className="text-ba-pearl">{hero.recipe.ratio}</strong>
                </span>
                <span>
                  {t("homeFeaturedRecipes.timeLabel")}{" "}
                  <strong className="text-ba-pearl">{hero.recipe.time}</strong>
                </span>
              </div>

              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ba-gold group-hover:gap-3">
                {t("homeDiscover.enterLabel")}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        </RevealOnScroll>

        {rest.length > 0 && (
          <RevealOnScroll delay={160}>
            <ul className="mt-20 divide-y divide-ba-espresso/[0.08] border-t border-ba-espresso/[0.08]">
              {rest.slice(0, 5).map(({ recipe, slug }) => {
                const brewKey = brewMethodLabelKey(recipe.brewMethod);
                return (
                  <li key={slug}>
                    <Link
                      href={`/recipes/${slug}`}
                      className={`group flex items-center gap-6 py-7 sm:gap-8 sm:py-8 ${dsMotion.transition} hover:bg-ba-sand/25 ${dsFocus.ring}`}
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
                        <Image
                          src={recipe.image}
                          alt={recipe.name}
                          fill
                          sizes="80px"
                          className="object-cover motion-safe:group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ba-bronze">
                          {recipe.country} · {brewKey ? t(brewKey) : recipe.brewMethod}
                        </p>
                        <p className="font-display mt-1 truncate text-xl tracking-[-0.02em] text-ba-espresso sm:text-2xl">
                          {recipe.name}
                        </p>
                        <p className="mt-1 hidden truncate text-sm text-ba-coffee/60 sm:block">{recipe.notes}</p>
                      </div>
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-ba-coffee/35 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:text-ba-bronze" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </RevealOnScroll>
        )}

        <RevealOnScroll delay={200}>
          <div className="mt-16 text-center lg:text-start">
            <RippleLink href="/recipes" className={btnSecondary}>
              {t("homeFeaturedRecipes.viewAll")}
            </RippleLink>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

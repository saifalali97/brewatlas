"use client";

import Image from "next/image";
import Link from "next/link";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { Chapter } from "@/app/components/atlas/chapter";
import { Folio, FolioItem } from "@/app/components/atlas/folio";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { MotionReveal } from "@/lib/design-system/motion";
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

/** Chapter 3 — The Cover. Single magazine spread at editorial scale. */
export function FeaturedCoverSection({ items }: { items: FeaturedRecipeItem[] }) {
  const { t } = useTranslations();
  const hero = items[0];

  if (!hero) return null;

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
    <Chapter id="the-cover" rhythm="day" padding="chapter" wide ariaLabelledBy="cover-heading">
      <MotionReveal>
        <p className={acTypography.eyebrow}>{t("homeFeaturedRecipes.eyebrow")}</p>
        <h2 id="cover-heading" className={`mt-6 max-w-2xl ${acTypography.h1}`}>
          {t("homeFeaturedRecipes.title")}
        </h2>
      </MotionReveal>

      <MotionReveal delay={100} className="mt-16">
        <div className="relative overflow-hidden rounded-none bg-ac-espresso lg:grid lg:grid-cols-12 lg:min-h-[34rem]">
          <Link
            href={`/recipes/${hero.slug}`}
            className={`group contents ${acFocus.ring}`}
          >
            <div className="relative min-h-[22rem] lg:col-span-7 lg:min-h-full">
              <Image
                src={hero.recipe.image}
                alt={heroLabels.imageAlt}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="photo-grade-library object-cover motion-safe:group-hover:brightness-[1.03]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ac-espresso/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-ac-espresso/20" />
              {hero.recipe.featured && (
                <span className="absolute start-6 top-6 rounded-full border border-ac-gold/35 bg-ac-gold/15 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ac-gold">
                  {t("homeFeaturedRecipes.editorsChoice")}
                </span>
              )}
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-5 lg:p-14 xl:p-16">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-ac-gold/85">
                {hero.recipe.country}
              </p>
              <h3 className="font-display mt-4 text-3xl leading-[1.08] tracking-[-0.03em] text-ac-pearl sm:text-4xl lg:text-[2.75rem]">
                {hero.recipe.name}
              </h3>
              <p className="mt-3 text-sm text-ac-sand/75">{hero.recipe.origin}</p>
              <p className="mt-6 text-base leading-[1.75] text-ac-sand/85">{hero.recipe.notes}</p>

              <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-ba-espresso/08 pt-8 text-sm text-ac-sand/70">
                <DifficultyIndicator
                  level={hero.recipe.difficulty}
                  label={heroLabels.difficultyLabel}
                  labelClassName="text-sm text-ac-sand/65"
                />
                <span>
                  {t("homeFeaturedRecipes.ratioLabel")}{" "}
                  <strong className="text-ac-pearl">{hero.recipe.ratio}</strong>
                </span>
                <span>
                  {t("homeFeaturedRecipes.timeLabel")}{" "}
                  <strong className="text-ac-pearl">{hero.recipe.time}</strong>
                </span>
              </div>

              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ac-gold">
                {t("homeDiscover.enterLabel")} →
              </span>
            </div>
          </Link>
        </div>
      </MotionReveal>
    </Chapter>
  );
}

/** Chapter 6 — The Table. Typographic folio index, three editions max. */
export function FeaturedTableSection({
  items,
  btnSecondary,
}: FeaturedRecipesSectionProps) {
  const { t } = useTranslations();
  const tableItems = items.slice(1, 4);

  if (tableItems.length === 0) return null;

  return (
    <Chapter id="the-table" rhythm="dawn" padding="chapter" ariaLabelledBy="table-heading">
      <MotionReveal>
        <p className={acTypography.eyebrow}>{t("homeFeaturedRecipes.eyebrow")}</p>
        <h2 id="table-heading" className={`mt-6 max-w-xl ${acTypography.h2}`}>
          {t("homeFeaturedRecipes.title")}
        </h2>
        <p className={`mt-4 max-w-lg ${acTypography.body}`}>{t("homeFeaturedRecipes.description")}</p>
      </MotionReveal>

      <MotionReveal delay={100} className="mt-16">
        <Folio ariaLabel={t("homeFeaturedRecipes.title")}>
          {tableItems.map(({ recipe, slug }, index) => {
            const brewKey = brewMethodLabelKey(recipe.brewMethod);
            return (
              <FolioItem
                key={slug}
                href={`/recipes/${slug}`}
                title={recipe.name}
                index={String(index + 1).padStart(2, "0")}
                imageSrc={recipe.image}
                imageAlt={recipe.name}
                meta={
                  <p className={acTypography.folioMeta}>
                    {recipe.country} · {brewKey ? t(brewKey) : recipe.brewMethod}
                  </p>
                }
              />
            );
          })}
        </Folio>
      </MotionReveal>

      <MotionReveal delay={160}>
        <div className="mt-16">
          <RippleLink href="/recipes" className={btnSecondary}>
            {t("homeFeaturedRecipes.viewAll")}
          </RippleLink>
        </div>
      </MotionReveal>
    </Chapter>
  );
}

/** @deprecated Use FeaturedCoverSection + FeaturedTableSection */
export function FeaturedRecipesSection(props: FeaturedRecipesSectionProps) {
  return (
    <>
      <FeaturedCoverSection items={props.items} />
      <FeaturedTableSection {...props} />
    </>
  );
}

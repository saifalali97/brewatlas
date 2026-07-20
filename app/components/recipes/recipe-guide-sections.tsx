import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { RecipeEditorialSection } from "@/app/components/recipes/recipe-editorial-hero";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import {
  Droplets,
  Filter,
  FlaskConical,
  Scale,
  Settings2,
  Thermometer,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/types";
import type { StaticRecipeDetail } from "@/types/static-recipe-detail";
import type { FeaturedRecipe } from "@/types/homepage";
import { getRecipeBySlug } from "@/lib/data/recipes";

type RecipeGuideSectionsProps = {
  detail: StaticRecipeDetail;
  recipe: FeaturedRecipe;
  dictionary: Dictionary;
};

function BulletList({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className={`${acTypography.body} mt-4 list-disc space-y-2 ps-5`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ProseBlock({ text }: { text: string }) {
  return <p className={`${acTypography.body} whitespace-pre-line`}>{text}</p>;
}

/** Renders the full editorial brew guide for static catalog recipes. */
export function RecipeGuideSections({ detail, recipe, dictionary }: RecipeGuideSectionsProps) {
  const d = dictionary.recipeDetail;
  const t = detail.troubleshooting;

  return (
    <>
      <RecipeEditorialSection title={d.whyThisRecipeExistsTitle} className="mt-14">
        <ProseBlock text={detail.whyThisRecipeExists} />
      </RecipeEditorialSection>

      <RecipeEditorialSection title={d.whyParametersWorkTitle} className="mt-14">
        <ProseBlock text={detail.whyParametersWork} />
      </RecipeEditorialSection>

      <RecipeEditorialSection title={d.brewingDetailsTitle} className="mt-14">
        <div className="grid gap-3 sm:grid-cols-2">
          <MetaTile icon={Settings2} label={d.deviceLabel} value={detail.device} />
          <MetaTile icon={Settings2} label={d.grinderLabel} value={detail.grinder} />
          <MetaTile icon={Settings2} label={d.grindSizeLabel} value={detail.grindSize} />
          {detail.filter ? <MetaTile icon={Filter} label={d.filterLabel} value={detail.filter} /> : null}
          <MetaTile icon={Droplets} label={d.waterRecipeLabel} value={detail.waterProfile} />
          <MetaTile icon={Thermometer} label={d.waterTempLabel} value={`${detail.waterTemperatureC}°C`} />
          <MetaTile icon={Scale} label={d.coffeeDoseLabel} value={`${detail.coffeeDoseG}g`} />
          <MetaTile icon={Droplets} label={d.waterLabel} value={`${detail.waterAmountG}g`} />
          {detail.bloomAmountG !== null ? (
            <MetaTile
              icon={Droplets}
              label={d.bloomLabel}
              value={`${detail.bloomAmountG}g${detail.bloomTime ? ` / ${detail.bloomTime}` : ""}`}
            />
          ) : null}
          <MetaTile icon={Scale} label={d.yieldLabel} value={`${detail.yieldG}g`} />
        </div>
      </RecipeEditorialSection>

      {detail.bloomExplanation ? (
        <RecipeEditorialSection title={d.bloomExplanationTitle} className="mt-14">
          <ProseBlock text={detail.bloomExplanation} />
        </RecipeEditorialSection>
      ) : null}

      {detail.pours.length > 0 ? (
        <RecipeEditorialSection title={d.pourStructureTitle} className="mt-14">
          <ol className="space-y-3">
            {detail.pours.map((pour) => (
              <li
                key={pour.pourNumber}
                className="ac-folio-divider flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4"
              >
                <span className="text-sm font-medium text-ac-espresso">
                  {d.pourPrefix} {pour.pourNumber}
                </span>
                {pour.waterAmountG !== null ? (
                  <span className="text-sm text-ac-espresso">{pour.waterAmountG}g</span>
                ) : null}
                {pour.timeLabel ? (
                  <span className="text-sm text-ac-espresso">
                    {d.atTimeLabel} {pour.timeLabel}
                  </span>
                ) : null}
                <span className="text-sm text-ac-espresso">— {pour.notes}</span>
              </li>
            ))}
          </ol>
        </RecipeEditorialSection>
      ) : null}

      <RecipeEditorialSection title={d.instructionsTitle} className="mt-14">
        <ProseBlock text={detail.instructions} />
      </RecipeEditorialSection>

      <RecipeEditorialSection title={d.expectedCupTitle} className="mt-14">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ac-espresso/70">{d.expectedExtractionLabel}</dt>
            <dd className={`${acTypography.body} mt-2`}>{detail.expectedCup.extraction}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ac-espresso/70">{d.expectedBodyLabel}</dt>
            <dd className={`${acTypography.body} mt-2`}>{detail.expectedCup.body}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ac-espresso/70">{d.expectedSweetnessLabel}</dt>
            <dd className={`${acTypography.body} mt-2`}>{detail.expectedCup.sweetness}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ac-espresso/70">{d.expectedAcidityLabel}</dt>
            <dd className={`${acTypography.body} mt-2`}>{detail.expectedCup.acidity}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ac-espresso/70">{d.expectedAftertasteLabel}</dt>
            <dd className={`${acTypography.body} mt-2`}>{detail.expectedCup.aftertaste}</dd>
          </div>
        </dl>
      </RecipeEditorialSection>

      <RecipeEditorialSection title={d.flavorNotesTitle} className="mt-14">
        <ProseBlock text={detail.flavorNotes || recipe.notes} />
      </RecipeEditorialSection>

      <RecipeEditorialSection title={d.waterChemistryTitle} className="mt-14">
        <ProseBlock text={detail.waterChemistry} />
      </RecipeEditorialSection>

      <RecipeEditorialSection title={d.grinderNotesTitle} className="mt-14">
        <ProseBlock text={detail.grinderNotes} />
      </RecipeEditorialSection>

      {detail.filter ? (
        <RecipeEditorialSection title={d.filterNotesTitle} className="mt-14">
          <ProseBlock text={detail.filterNotes} />
        </RecipeEditorialSection>
      ) : null}

      <RecipeEditorialSection title={d.troubleshootingTitle} className="mt-14">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-semibold text-ac-espresso">{d.ifBitterLabel}</dt>
            <dd className={`${acTypography.body} mt-1`}>{t.bitter}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ac-espresso">{d.ifSourLabel}</dt>
            <dd className={`${acTypography.body} mt-1`}>{t.sour}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ac-espresso">{d.ifWeakLabel}</dt>
            <dd className={`${acTypography.body} mt-1`}>{t.weak}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ac-espresso">{d.ifStrongLabel}</dt>
            <dd className={`${acTypography.body} mt-1`}>{t.strong}</dd>
          </div>
          {t.channeling ? (
            <div>
              <dt className="text-sm font-semibold text-ac-espresso">{d.ifChannelingLabel}</dt>
              <dd className={`${acTypography.body} mt-1`}>{t.channeling}</dd>
            </div>
          ) : null}
          {t.slowDrawdown ? (
            <div>
              <dt className="text-sm font-semibold text-ac-espresso">{d.ifSlowDrawdownLabel}</dt>
              <dd className={`${acTypography.body} mt-1`}>{t.slowDrawdown}</dd>
            </div>
          ) : null}
          {t.fastDrawdown ? (
            <div>
              <dt className="text-sm font-semibold text-ac-espresso">{d.ifFastDrawdownLabel}</dt>
              <dd className={`${acTypography.body} mt-1`}>{t.fastDrawdown}</dd>
            </div>
          ) : null}
        </dl>
      </RecipeEditorialSection>

      {detail.expertTips.length > 0 ? (
        <RecipeEditorialSection title={d.expertTipsTitle} className="mt-14">
          <BulletList items={detail.expertTips} />
        </RecipeEditorialSection>
      ) : null}

      {detail.competitionNotes ? (
        <RecipeEditorialSection title={d.competitionNotesTitle} className="mt-14">
          <ProseBlock text={detail.competitionNotes} />
        </RecipeEditorialSection>
      ) : null}

      <RecipeEditorialSection title={d.whenToChooseTitle} className="mt-14">
        <ProseBlock text={detail.whenToChoose} />
      </RecipeEditorialSection>

      <RecipeEditorialSection title={d.bestForTitle} className="mt-14">
        <ProseBlock text={detail.bestFor} />
      </RecipeEditorialSection>

      <RecipeEditorialSection title={d.beanRecommendationsTitle} className="mt-14">
        <ProseBlock text={detail.beanRecommendations} />
      </RecipeEditorialSection>

      <RecipeEditorialSection title={d.roastRecommendationsTitle} className="mt-14">
        <ProseBlock text={detail.roastRecommendations} />
      </RecipeEditorialSection>

      <RecipeEditorialSection title={d.waterRecommendationsTitle} className="mt-14">
        <ProseBlock text={detail.waterRecommendations} />
      </RecipeEditorialSection>

      {detail.commonMistakes.length > 0 ? (
        <RecipeEditorialSection title={d.commonMistakesTitle} className="mt-14">
          <BulletList items={detail.commonMistakes} />
        </RecipeEditorialSection>
      ) : null}

      {detail.faq.length > 0 ? (
        <RecipeEditorialSection title={d.faqTitle} className="mt-14">
          <dl className="space-y-5">
            {detail.faq.map((item) => (
              <div key={item.question}>
                <dt className="text-sm font-semibold text-ac-espresso">{item.question}</dt>
                <dd className={`${acTypography.body} mt-2`}>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </RecipeEditorialSection>
      ) : null}

      {detail.storageTips ? (
        <RecipeEditorialSection title={d.storageTipsTitle} className="mt-14">
          <ProseBlock text={detail.storageTips} />
        </RecipeEditorialSection>
      ) : null}

      {detail.relatedRecipeSlugs.length > 0 ? (
        <RecipeEditorialSection title={d.relatedRecipesTitle} className="mt-14">
          <ul className="space-y-2">
            {detail.relatedRecipeSlugs.map((relatedSlug) => {
              const related = getRecipeBySlug(relatedSlug);
              if (!related) return null;
              return (
                <li key={relatedSlug}>
                  <RippleLink href={`/recipes/${relatedSlug}`} className="text-sm font-medium text-ba-bronze hover:text-ac-espresso">
                    {related.name}
                  </RippleLink>
                </li>
              );
            })}
          </ul>
        </RecipeEditorialSection>
      ) : null}

      {detail.galleryImages.length > 0 ? (
        <RecipeEditorialSection title={d.galleryTitle} className="mt-14">
          <div className="grid gap-4 sm:grid-cols-2">
            {detail.galleryImages.map((src) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-ba-espresso/8">
                <OptimizedImage
                  src={src}
                  alt=""
                  fill
                  loading="lazy"
                  sizes={IMAGE_SIZE_PRESETS.recipeGallery}
                  className="object-cover object-center"
                />
              </div>
            ))}
          </div>
        </RecipeEditorialSection>
      ) : null}

      <div className="mx-auto mt-10 flex max-w-3xl items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-emerald-800/80">
        <FlaskConical aria-hidden className="h-3.5 w-3.5" />
        {d.verifiedBadge}
      </div>
    </>
  );
}

/** Text sections for DB recipes when translation extras are present. */
export function RecipeTextExtrasSections({
  dictionary,
  brewNotes,
  tips,
  warnings,
}: {
  dictionary: Dictionary;
  brewNotes?: string | null;
  tips?: string | null;
  warnings?: string | null;
}) {
  const d = dictionary.recipeDetail;
  const tipLines = tips?.split("\n").filter(Boolean) ?? [];
  const warningLines = warnings?.split("\n").filter(Boolean) ?? [];

  return (
    <>
      {brewNotes ? (
        <RecipeEditorialSection title={d.whyParametersWorkTitle} className="mt-14">
          <p className={`${acTypography.body} whitespace-pre-line`}>{brewNotes}</p>
        </RecipeEditorialSection>
      ) : null}
      {tipLines.length > 0 ? (
        <RecipeEditorialSection title={d.expertTipsTitle} className="mt-14">
          <BulletList items={tipLines} />
        </RecipeEditorialSection>
      ) : null}
      {warningLines.length > 0 ? (
        <RecipeEditorialSection title={d.commonMistakesTitle} className="mt-14">
          <BulletList items={warningLines} />
        </RecipeEditorialSection>
      ) : null}
    </>
  );
}

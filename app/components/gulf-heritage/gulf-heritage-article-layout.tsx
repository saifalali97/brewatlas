import { RippleLink } from "@/app/components/ui/ripple-link";
import { GhArticleNavigation } from "@/app/components/gulf-heritage/gh-article-navigation";
import { GhArticleSection, type GhArticleSectionVariant } from "@/app/components/gulf-heritage/gh-article-section";
import { GhRelatedContentGrid } from "@/app/components/gulf-heritage/gh-related-content-grid";
import { GhRecipesExperience } from "@/app/components/gulf-heritage/gh-recipes-experience";
import { GhSectionDivider } from "@/app/components/gulf-heritage/gh-section-divider";
import { GhTableOfContents, type GhTocItem } from "@/app/components/gulf-heritage/gh-table-of-contents";
import { getCategoryPageNavigation } from "@/app/components/gulf-heritage/shared/gh-navigation-utils";
import { ghMotion, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";
import { GulfHeritageBreadcrumbs } from "@/app/components/gulf-heritage/gulf-heritage-breadcrumbs";
import { GulfHeritageEditorialStatusBadge } from "@/app/components/gulf-heritage/gulf-heritage-editorial-status";
import { GulfHeritageGallerySection, GulfHeritageHeroSection } from "@/app/components/gulf-heritage/gulf-heritage-gallery-section";
import { GulfHeritageIntroSection } from "@/app/components/gulf-heritage/gulf-heritage-intro-section";
import { GulfHeritageReferencesList } from "@/app/components/gulf-heritage/gulf-heritage-references-list";
import { buttons } from "@/lib/constants/styles";
import { interpolate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import {
  ARABIC_COFFEE_SECTION_KEYS,
  TEA_KARAK_SECTION_KEYS,
  type GulfHeritageArabicCoffeeSectionKey,
  type GulfHeritageTeaKarakSectionKey,
} from "@/types/gulf-heritage-article-content";
import type { GulfHeritageResolvedPage } from "@/types/gulf-heritage";
import { gulfHeritageCategoryPath } from "@/types/gulf-heritage";

type GulfHeritageArticleLayoutProps = {
  page: GulfHeritageResolvedPage;
  dictionary: Dictionary;
};

function sectionVariant(key: string): GhArticleSectionVariant {
  if (key === "history") return "history";
  if (key === "culturalSignificance") return "cultural";
  return "default";
}

function buildArticleToc(
  dictionary: Dictionary,
  page: GulfHeritageResolvedPage,
  isTea: boolean,
): GhTocItem[] {
  const gh = dictionary.gulfHeritagePage;
  const items: GhTocItem[] = [{ id: "gh-section-intro", label: gh.sections.introduction }];

  if (page.articleContent?.glossary) {
    items.push({ id: "gh-section-glossary", label: gh.sections.glossary });
  }

  const sectionKeys = isTea ? TEA_KARAK_SECTION_KEYS : ARABIC_COFFEE_SECTION_KEYS;
  const labels = isTea ? gh.teaSections : gh.articleSections;

  for (const key of sectionKeys) {
    items.push({ id: `gh-section-${key}`, label: labels[key as keyof typeof labels] });
  }

  if (page.relatedPages.length > 0) {
    items.push({
      id: "gh-section-related",
      label: isTea ? gh.sections.relatedGuides : gh.sections.relatedPages,
    });
  }

  items.push({ id: "gh-section-references", label: gh.sections.references });

  if (page.relatedRecipes.length > 0) {
    items.push({ id: "gh-section-recipes", label: gh.sections.relatedRecipes });
  }

  items.push({ id: "gh-section-gallery", label: gh.imageSections.gallery });

  return items;
}

/** Article layout for Arabic Coffee and Tea & Karak guides. */
export function GulfHeritageArticleLayout({ page, dictionary }: GulfHeritageArticleLayoutProps) {
  const gh = dictionary.gulfHeritagePage;
  const presentation = gh.presentation;
  const sections = gh.sections;
  const pending = sections.verifiedContentComingSoon;
  const content = page.articleContent;
  const isTea = content?.variant === "tea-karak";
  const galleryLabels = gh.imageSections;
  const creditLabels = gh.imageCredits;
  const tocItems = buildArticleToc(dictionary, page, isTea);
  const navigation = getCategoryPageNavigation(
    page.countrySlug,
    page.categorySlug,
    page.definition.slug,
    gh.pages,
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-14">
      <div className={`max-w-[44rem] ${ghMotion.fadeIn}`}>
        <GulfHeritageBreadcrumbs items={page.breadcrumbs} />

        <GulfHeritageHeroSection
          images={page.images}
          labels={galleryLabels}
          creditLabels={creditLabels}
          pageTitle={page.copy.title}
        />

        <header className="mt-8">
          <p className={ghTypography.sectionEyebrow}>
            {page.categoryCopy.title} · {page.countryCopy.name}
          </p>
          <h1
            id="gulf-heritage-page-heading"
            className="mt-3 font-display text-[2rem] font-semibold leading-[1.06] tracking-[-0.035em] text-ac-espresso sm:text-[2.5rem]"
          >
            {page.copy.title}
          </h1>
          <div className="mt-4">
            <GulfHeritageEditorialStatusBadge status={page.editorialStatus} labels={gh.editorialStatus} />
          </div>
        </header>

        <GulfHeritageIntroSection title={sections.introduction} intro={page.copy.intro} pendingMessage={pending} />

        {content?.glossary ? (
          <GhArticleSection
            id="gh-section-glossary"
            title={sections.glossary}
            body={content.glossary}
            pendingMessage={pending}
            variant="glossary"
          />
        ) : null}

        {content?.variant === "arabic-coffee"
          ? ARABIC_COFFEE_SECTION_KEYS.map((key) => (
              <GhArticleSection
                key={key}
                id={`gh-section-${key}`}
                title={gh.articleSections[key as GulfHeritageArabicCoffeeSectionKey]}
                body={content.sections[key]}
                pendingMessage={pending}
                variant={sectionVariant(key)}
              />
            ))
          : null}

        {content?.variant === "tea-karak"
          ? TEA_KARAK_SECTION_KEYS.map((key) => (
              <GhArticleSection
                key={key}
                id={`gh-section-${key}`}
                title={gh.teaSections[key as GulfHeritageTeaKarakSectionKey]}
                body={content.sections[key]}
                pendingMessage={pending}
                variant={sectionVariant(key)}
              />
            ))
          : null}

        <GhSectionDivider />

        <div id="gh-section-related">
          <GhRelatedContentGrid
            title={isTea ? sections.relatedGuides : sections.relatedPages}
            country={page.countryCopy.name}
            category={page.categoryCopy.title}
            readLabel={presentation.readGuide}
            pendingDescription={pending}
            statusLabels={gh.editorialStatus}
            pages={page.relatedPages}
          />
        </div>

        <div id="gh-section-references">
          <GulfHeritageReferencesList
            title={sections.references}
            references={page.references}
            pendingMessage={pending}
            typeLabels={gh.referenceTypes}
            fieldLabels={gh.referenceFields}
          />
        </div>

        <GhRecipesExperience
          title={sections.relatedRecipes}
          recipes={page.relatedRecipes}
          country={page.countryCopy.name}
          category={page.categoryCopy.title}
          editorialStatus={page.editorialStatus}
          verifiedContentComingSoon={sections.verifiedRecipeComingSoon}
          statusLabels={gh.recipeStatus}
          fieldLabels={gh.recipeFields}
          ingredientLabels={{
            main: presentation.mainIngredients,
            optional: presentation.optionalIngredients,
            garnishes: presentation.garnishes,
            notes: presentation.ingredientNotes,
          }}
          presentationLabels={{
            stepTemplate: presentation.stepTemplate,
          }}
        />

        <div id="gh-section-gallery">
          <GulfHeritageGallerySection
            images={page.images}
            labels={galleryLabels}
            creditLabels={creditLabels}
            pageTitle={page.copy.title}
            slots={["inline", "stepImages", "gallery", "equipment", "historical"]}
          />
        </div>

        <GhArticleNavigation
          previousLabel={presentation.previousArticle}
          nextLabel={presentation.nextArticle}
          previous={navigation.previous}
          next={navigation.next}
        />

        <div className="mt-12 flex flex-col gap-3 border-t border-ba-espresso/8 pt-8 sm:flex-row sm:items-center">
          <RippleLink
            href={gulfHeritageCategoryPath(page.countrySlug, page.categorySlug)}
            className={`${buttons.secondary} w-full sm:w-auto`}
          >
            {interpolate(gh.backToCategoryTemplate, { name: page.categoryCopy.title })}
          </RippleLink>
          <RippleLink href={`/gulf-heritage/${page.countrySlug}`} className={`${buttons.secondary} w-full sm:w-auto`}>
            {interpolate(gh.moreInCountryTemplate, { name: page.countryCopy.name })}
          </RippleLink>
        </div>
      </div>

      <aside className="hidden lg:block">
        <GhTableOfContents title={presentation.tableOfContents} items={tocItems} />
      </aside>
    </div>
  );
}

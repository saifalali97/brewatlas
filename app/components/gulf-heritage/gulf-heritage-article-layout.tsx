import { RippleLink } from "@/app/components/ui/ripple-link";
import { GulfHeritageGallerySection } from "@/app/components/gulf-heritage/gulf-heritage-gallery-section";
import { GulfHeritageReferencesList } from "@/app/components/gulf-heritage/gulf-heritage-references-list";
import { GulfHeritageRelatedTopics } from "@/app/components/gulf-heritage/gulf-heritage-related-topics";
import { GulfHeritageSlotSection } from "@/app/components/gulf-heritage/gulf-heritage-slot-section";
import { GulfHeritageVerifiedRecipesSection } from "@/app/components/gulf-heritage/gulf-heritage-verified-recipes-section";
import { buttons } from "@/lib/constants/styles";
import { interpolate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import {
  ARABIC_COFFEE_SECTION_KEYS,
  TEA_KARAK_SECTION_KEYS,
} from "@/types/gulf-heritage-article-content";
import type { GulfHeritageResolvedPage } from "@/types/gulf-heritage";
import { gulfHeritageCategoryPath } from "@/types/gulf-heritage";

type GulfHeritageArticleLayoutProps = {
  page: GulfHeritageResolvedPage;
  dictionary: Dictionary;
};

/** Article layout for Arabic Coffee and Tea & Karak guides. */
export function GulfHeritageArticleLayout({ page, dictionary }: GulfHeritageArticleLayoutProps) {
  const gh = dictionary.gulfHeritagePage;
  const sections = gh.sections;
  const pending = sections.verifiedContentComingSoon;
  const content = page.articleContent;
  const isTea = content?.variant === "tea-karak";

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-ac-espresso">
        {page.categoryCopy.title} · {page.countryCopy.name}
      </p>
      <h1
        id="gulf-heritage-page-heading"
        className="mt-3 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-ac-espresso sm:text-4xl"
      >
        {page.copy.title}
      </h1>

      {content?.variant === "arabic-coffee"
        ? ARABIC_COFFEE_SECTION_KEYS.map((key) => (
            <GulfHeritageSlotSection
              key={key}
              title={gh.articleSections[key]}
              body={content.sections[key]}
              pendingMessage={pending}
            />
          ))
        : null}

      {content?.variant === "tea-karak"
        ? TEA_KARAK_SECTION_KEYS.map((key) => (
            <GulfHeritageSlotSection
              key={key}
              title={gh.teaSections[key]}
              body={content.sections[key]}
              pendingMessage={pending}
            />
          ))
        : null}

      <GulfHeritageGallerySection
        images={page.images}
        labels={gh.imageSections}
        pendingMessage={sections.imagePending}
        pageTitle={page.copy.title}
      />

      <GulfHeritageVerifiedRecipesSection
        title={sections.verifiedRecipes}
        recipes={page.verifiedRecipes}
        verifiedContentComingSoon={pending}
      />

      <GulfHeritageRelatedTopics
        title={isTea ? sections.relatedGuides : sections.relatedPages}
        pages={page.relatedPages}
      />

      <GulfHeritageReferencesList
        title={sections.references}
        references={page.references}
        pendingMessage={pending}
      />

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
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
  );
}

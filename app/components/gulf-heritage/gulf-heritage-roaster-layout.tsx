import Link from "next/link";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { GhArticleNavigation } from "@/app/components/gulf-heritage/gh-article-navigation";
import { GhArticleSection } from "@/app/components/gulf-heritage/gh-article-section";
import { GhImagePlaceholder } from "@/app/components/gulf-heritage/gh-image-placeholder";
import { GhRelatedContentGrid } from "@/app/components/gulf-heritage/gh-related-content-grid";
import { GhRecipesExperience } from "@/app/components/gulf-heritage/gh-recipes-experience";
import { GhSectionDivider } from "@/app/components/gulf-heritage/gh-section-divider";
import { GhTableOfContents, type GhTocItem } from "@/app/components/gulf-heritage/gh-table-of-contents";
import { getCategoryPageNavigation } from "@/app/components/gulf-heritage/shared/gh-navigation-utils";
import { ghMotion, ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";
import { GulfHeritageBreadcrumbs } from "@/app/components/gulf-heritage/gulf-heritage-breadcrumbs";
import { GulfHeritageEditorialStatusBadge } from "@/app/components/gulf-heritage/gulf-heritage-editorial-status";
import { GulfHeritageGallerySection, GulfHeritageHeroSection } from "@/app/components/gulf-heritage/gulf-heritage-gallery-section";
import { GulfHeritageIntroSection } from "@/app/components/gulf-heritage/gulf-heritage-intro-section";
import { GulfHeritagePendingContent } from "@/app/components/gulf-heritage/gulf-heritage-pending-content";
import { GulfHeritageReferencesList } from "@/app/components/gulf-heritage/gulf-heritage-references-list";
import { acFocus } from "@/lib/design-system/atlas-canon";
import { buttons, surfaces } from "@/lib/constants/styles";
import { interpolate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import type { GulfHeritageResolvedPage } from "@/types/gulf-heritage";
import { gulfHeritageCategoryPath } from "@/types/gulf-heritage";
import { resolveGulfHeritageImageAlt, resolveGulfHeritageImageUrl } from "@/types/gulf-heritage-images";

type GulfHeritageRoasterLayoutProps = {
  page: GulfHeritageResolvedPage;
  dictionary: Dictionary;
};

function RoasterListSection({
  id,
  label,
  items,
  pending,
}: {
  id: string;
  label: string;
  items: readonly string[];
  pending: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-10 scroll-mt-28">
      <h2 id={`${id}-heading`} className={ghTypography.sectionTitle}>
        {label}
      </h2>
      <div className={`${ghSurfaces.articlePanel} mt-5 px-6 py-6 sm:px-8`}>
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ac-espresso/88">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ba-bronze/70" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <GulfHeritagePendingContent message={pending} />
        )}
      </div>
    </section>
  );
}

/** Roaster profile layout with premium presentation. */
export function GulfHeritageRoasterLayout({ page, dictionary }: GulfHeritageRoasterLayoutProps) {
  const gh = dictionary.gulfHeritagePage;
  const presentation = gh.presentation;
  const roaster = gh.roaster;
  const sections = gh.sections;
  const pending = sections.verifiedContentComingSoon;
  const fields = page.roasterFields;
  const logo = page.images.roasterLogo;
  const cover = page.images.roasterCover ?? page.images.hero;
  const logoUrl = resolveGulfHeritageImageUrl(logo);
  const galleryLabels = gh.imageSections;
  const creditLabels = gh.imageCredits;

  const tocItems: GhTocItem[] = [
    { id: "gh-section-intro", label: sections.introduction },
    { id: "gh-section-history", label: roaster.history },
    { id: "gh-section-branches", label: roaster.branches },
    { id: "gh-section-philosophy", label: roaster.roastingPhilosophy },
    { id: "gh-section-related", label: sections.relatedPages },
    { id: "gh-section-references", label: sections.references },
    ...(page.relatedRecipes.length > 0 ? [{ id: "gh-section-recipes", label: sections.relatedRecipes }] : []),
    { id: "gh-section-gallery", label: galleryLabels.gallery },
  ];

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
          images={{ ...page.images, hero: cover }}
          labels={{ ...galleryLabels, hero: roaster.coverImage }}
          creditLabels={creditLabels}
          pendingMessage={sections.imagePending}
          pageTitle={page.copy.title}
          placeholderTitle={presentation.imagePlaceholderTitle}
          placeholderDescription={presentation.imagePlaceholderDescription}
        />

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className={`${ghSurfaces.cardElevated} w-full shrink-0 overflow-hidden p-5 lg:w-52`}>
            <p className={ghTypography.metaLabel}>{roaster.logo}</p>
            {logoUrl && logo ? (
              <OptimizedImage
                src={logoUrl}
                alt={resolveGulfHeritageImageAlt(logo, `${page.copy.title} logo`)}
                width={240}
                height={128}
                loading="lazy"
                className="mt-4 max-h-32 w-auto"
              />
            ) : (
              <div className="mt-4">
                <GhImagePlaceholder
                  title={presentation.imagePlaceholderTitle}
                  description={presentation.imagePlaceholderDescription}
                  compact
                />
              </div>
            )}
          </div>

          <header className={`${ghSurfaces.articlePanel} flex-1 px-6 py-6 sm:px-8`}>
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

            {fields ? (
              <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                {[
                  { label: roaster.location, value: fields.location },
                  { label: roaster.foundingYear, value: fields.foundingYear },
                  { label: roaster.founder, value: fields.founder },
                ].map((item) => (
                  <div key={item.label} className={`${ghSurfaces.articlePanelInset} px-4 py-3`}>
                    <dt className={ghTypography.metaLabel}>{item.label}</dt>
                    <dd className="mt-1 font-medium text-ac-espresso">
                      {item.value == null || item.value === "" ? pending : item.value}
                    </dd>
                  </div>
                ))}
                {fields.websiteUrl ? (
                  <div className={`${ghSurfaces.articlePanelInset} px-4 py-3`}>
                    <dt className={ghTypography.metaLabel}>{roaster.website}</dt>
                    <dd className="mt-1">
                      <Link
                        href={fields.websiteUrl}
                        className={`font-medium text-ba-bronze underline-offset-2 hover:underline ${acFocus.ring}`}
                        rel="noopener noreferrer"
                      >
                        {fields.websiteUrl}
                      </Link>
                    </dd>
                  </div>
                ) : null}
                {fields.instagramUrl ? (
                  <div className={`${ghSurfaces.articlePanelInset} px-4 py-3`}>
                    <dt className={ghTypography.metaLabel}>{roaster.instagram}</dt>
                    <dd className="mt-1">
                      <Link
                        href={fields.instagramUrl}
                        className={`font-medium text-ba-bronze underline-offset-2 hover:underline ${acFocus.ring}`}
                        rel="noopener noreferrer"
                      >
                        {fields.instagramUrl}
                      </Link>
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </header>
        </div>

        <GulfHeritageIntroSection title={sections.introduction} intro={page.copy.intro} pendingMessage={pending} />

        <GhArticleSection
          id="gh-section-history"
          title={roaster.history}
          body={fields?.history ?? fields?.story ?? null}
          pendingMessage={pending}
        />

        <RoasterListSection
          id="gh-section-branches"
          label={roaster.branches}
          items={fields?.branches ?? []}
          pending={pending}
        />

        <GhArticleSection
          id="gh-section-philosophy"
          title={roaster.roastingPhilosophy}
          body={fields?.roastingPhilosophy ?? null}
          pendingMessage={pending}
        />

        <RoasterListSection
          id="gh-section-signature"
          label={roaster.signatureCoffees}
          items={fields?.signatureCoffees ?? []}
          pending={pending}
        />

        <GhArticleSection
          id="gh-section-lineup"
          title={roaster.coffeeLineup}
          body={fields?.coffeeLineup ?? null}
          pendingMessage={pending}
        />

        <RoasterListSection
          id="gh-section-origins"
          label={roaster.coffeeOrigins}
          items={fields?.coffeeOrigins ?? []}
          pending={pending}
        />

        <GhArticleSection
          id="gh-section-brewing"
          title={roaster.brewingRecommendations}
          body={fields?.brewingRecommendations ?? null}
          pendingMessage={pending}
        />

        <GhArticleSection
          id="gh-section-featured"
          title={roaster.featuredBeans}
          body={fields?.featuredBeans ?? null}
          pendingMessage={pending}
        />

        <GhArticleSection
          id="gh-section-awards"
          title={roaster.awards}
          body={fields?.awards ?? null}
          pendingMessage={pending}
        />

        {fields && fields.socialLinks.length > 0 ? (
          <section id="gh-section-social" className="mt-10 scroll-mt-28">
            <h2 className={ghTypography.sectionTitle}>{roaster.socialLinks}</h2>
            <ul className={`${surfaces.lightList} mt-5 divide-y divide-ba-espresso/08`}>
              {fields.socialLinks.map((link) => (
                <li key={link.url} className="px-5 py-4">
                  <Link
                    href={link.url}
                    className={`text-sm font-medium text-ba-bronze hover:text-ac-espresso ${acFocus.ring}`}
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <GhSectionDivider />

        <div id="gh-section-related">
          <GhRelatedContentGrid
            title={sections.relatedPages}
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
            references={page.references.length > 0 ? page.references : fields?.references ?? []}
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
            imagePlaceholderTitle: presentation.imagePlaceholderTitle,
            imagePlaceholderDescription: presentation.imagePlaceholderDescription,
          }}
        />

        <div id="gh-section-gallery">
          <GulfHeritageGallerySection
            images={page.images}
            labels={galleryLabels}
            creditLabels={creditLabels}
            pendingMessage={sections.imagePending}
            pageTitle={page.copy.title}
            slots={["inline", "stepImages", "gallery", "equipment", "historical"]}
            placeholderTitle={presentation.imagePlaceholderTitle}
            placeholderDescription={presentation.imagePlaceholderDescription}
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

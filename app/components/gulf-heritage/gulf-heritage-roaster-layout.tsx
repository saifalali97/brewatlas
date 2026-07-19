import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { GulfHeritageContentSection } from "@/app/components/gulf-heritage/gulf-heritage-content-section";
import { GulfHeritageGallerySection } from "@/app/components/gulf-heritage/gulf-heritage-gallery-section";
import { GulfHeritagePendingContent } from "@/app/components/gulf-heritage/gulf-heritage-pending-content";
import { GulfHeritageReferencesList } from "@/app/components/gulf-heritage/gulf-heritage-references-list";
import { GulfHeritageRelatedTopics } from "@/app/components/gulf-heritage/gulf-heritage-related-topics";
import { GulfHeritageVerifiedRecipesSection } from "@/app/components/gulf-heritage/gulf-heritage-verified-recipes-section";
import { buttons, surfaces } from "@/lib/constants/styles";
import { interpolate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import type { GulfHeritageResolvedPage } from "@/types/gulf-heritage";
import { gulfHeritageCategoryPath } from "@/types/gulf-heritage";

type GulfHeritageRoasterLayoutProps = {
  page: GulfHeritageResolvedPage;
  dictionary: Dictionary;
};

function RoasterField({ label, value, pending }: { label: string; value: string | number | null; pending: string }) {
  return (
    <div>
      <dt className="font-medium">{label}</dt>
      <dd>{value ?? pending}</dd>
    </div>
  );
}

/** Roaster profile layout — all fields remain placeholders until verified. */
export function GulfHeritageRoasterLayout({ page, dictionary }: GulfHeritageRoasterLayoutProps) {
  const gh = dictionary.gulfHeritagePage;
  const roaster = gh.roaster;
  const sections = gh.sections;
  const pending = sections.verifiedContentComingSoon;
  const fields = page.roasterFields;
  const images = {
    ...page.images,
    roasterCover: page.images.roasterCover ?? page.images.hero,
    roasterLogo: page.images.roasterLogo,
  };

  return (
    <div className="max-w-3xl">
      <GulfHeritageGallerySection
        images={{
          ...images,
          hero: images.roasterCover,
          gallery: images.gallery,
          equipment: images.equipment,
          historical: images.historical,
        }}
        labels={{
          hero: roaster.coverImage,
          gallery: gh.imageSections.gallery,
          equipment: gh.imageSections.equipment,
          historical: gh.imageSections.historical,
        }}
        pendingMessage={sections.imagePending}
        pageTitle={page.copy.title}
      />

      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        <GulfHeritageContentSection title={roaster.logo}>
          {images.roasterLogo ? (
            <OptimizedImage
              src={images.roasterLogo}
              alt={`${page.copy.title} logo`}
              width={240}
              height={128}
              className="max-h-32 w-auto"
            />
          ) : (
            <div className={`${surfaces.lightInset} flex min-h-[8rem] items-center justify-center px-6 py-8 text-center`}>
              <GulfHeritagePendingContent message={sections.imagePending} />
            </div>
          )}
        </GulfHeritageContentSection>

        <div className={`${surfaces.lightPanelCompact} flex-1 px-6 py-5`}>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ac-espresso">
            {page.categoryCopy.title} · {page.countryCopy.name}
          </p>
          <h1
            id="gulf-heritage-page-heading"
            className="mt-3 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-ac-espresso sm:text-4xl"
          >
            {page.copy.title}
          </h1>

          {fields ? (
            <dl className="mt-6 space-y-3 text-sm text-ac-espresso">
              <RoasterField label={roaster.location} value={fields.location} pending={pending} />
              <RoasterField label={roaster.foundingYear} value={fields.foundingYear} pending={pending} />
              <RoasterField label={roaster.website} value={fields.websiteUrl} pending={pending} />
              <RoasterField label={roaster.instagram} value={fields.instagramUrl} pending={pending} />
            </dl>
          ) : null}
        </div>
      </div>

      <GulfHeritageContentSection title={roaster.story}>
        {fields?.story ? <p>{fields.story}</p> : <GulfHeritagePendingContent message={pending} />}
      </GulfHeritageContentSection>

      <GulfHeritageContentSection title={roaster.roastingPhilosophy}>
        {fields?.roastingPhilosophy ? (
          <p>{fields.roastingPhilosophy}</p>
        ) : (
          <GulfHeritagePendingContent message={pending} />
        )}
      </GulfHeritageContentSection>

      <GulfHeritageContentSection title={roaster.coffeeLineup}>
        {fields?.coffeeLineup ? <p>{fields.coffeeLineup}</p> : <GulfHeritagePendingContent message={pending} />}
      </GulfHeritageContentSection>

      <GulfHeritageContentSection title={roaster.brewingRecommendations}>
        {fields?.brewingRecommendations ? (
          <p>{fields.brewingRecommendations}</p>
        ) : (
          <GulfHeritagePendingContent message={pending} />
        )}
      </GulfHeritageContentSection>

      <GulfHeritageContentSection title={roaster.featuredBeans}>
        {fields?.featuredBeans ? <p>{fields.featuredBeans}</p> : <GulfHeritagePendingContent message={pending} />}
      </GulfHeritageContentSection>

      <GulfHeritageContentSection title={roaster.awards}>
        {fields?.awards ? <p>{fields.awards}</p> : <GulfHeritagePendingContent message={pending} />}
      </GulfHeritageContentSection>

      <GulfHeritageVerifiedRecipesSection
        title={sections.verifiedRecipes}
        recipes={page.verifiedRecipes}
        verifiedContentComingSoon={pending}
      />

      <GulfHeritageRelatedTopics title={sections.relatedPages} pages={page.relatedPages} />

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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { GulfHeritageArticleLayout } from "@/app/components/gulf-heritage/gulf-heritage-article-layout";
import { GulfHeritageRoasterLayout } from "@/app/components/gulf-heritage/gulf-heritage-roaster-layout";
import {
  getGulfHeritagePageCopy,
  listGulfHeritageStaticPageParams,
  resolveGulfHeritagePage,
} from "@/lib/content/gulf-heritage";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildArticleJsonLd } from "@/lib/seo/json-ld";
import { buildLocalizedMetadata, localizedPathUrl } from "@/lib/seo/localized-metadata";

type GulfHeritagePageRouteProps = {
  params: Promise<{ country: string; category: string; page: string }>;
};

export function generateStaticParams() {
  return listGulfHeritageStaticPageParams();
}

export async function generateMetadata({ params }: GulfHeritagePageRouteProps): Promise<Metadata> {
  const { country: countrySlug, category: categorySlug, page: pageSlug } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const gh = dictionary.gulfHeritagePage;
  const resolved = await resolveGulfHeritagePage(dictionary, countrySlug, categorySlug, pageSlug, locale);

  if (!resolved) {
    return buildLocalizedMetadata({
      pathname: `/gulf-heritage/${countrySlug}/${categorySlug}/${pageSlug}`,
      locale,
      title: gh.pageNotFoundTitle,
      description: dictionary.metadata.notFoundDescription,
      noIndex: true,
    });
  }

  return buildLocalizedMetadata({
    pathname: `/gulf-heritage/${countrySlug}/${categorySlug}/${pageSlug}`,
    locale,
    title: resolved.copy.seoTitle,
    description: resolved.copy.seoDescription,
    openGraphType: "article",
  });
}

export default async function GulfHeritagePageRoute({ params }: GulfHeritagePageRouteProps) {
  const { country: countrySlug, category: categorySlug, page: pageSlug } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const resolved = await resolveGulfHeritagePage(dictionary, countrySlug, categorySlug, pageSlug, locale);

  if (!resolved) {
    notFound();
  }

  const pageCopy = getGulfHeritagePageCopy(dictionary, resolved.definition.slug);
  const pathname = `/gulf-heritage/${countrySlug}/${categorySlug}/${pageSlug}`;
  const articleJsonLd =
    resolved.editorialStatus === "verified"
      ? buildArticleJsonLd({
          url: localizedPathUrl(pathname, locale),
          headline: resolved.copy.seoTitle,
          description: resolved.copy.seoDescription,
          dateModified: "2026-07-19",
        })
      : null;

  return (
    <>
      {articleJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      ) : null}
      <SectionFrame id="gulf-heritage-page" ariaLabelledBy="gulf-heritage-page-heading" padding="compact">
        {resolved.definition.kind === "roaster" ? (
          <GulfHeritageRoasterLayout page={resolved} dictionary={dictionary} />
        ) : (
          <GulfHeritageArticleLayout page={resolved} dictionary={dictionary} />
        )}

        <span className="sr-only">{pageCopy.title}</span>
      </SectionFrame>
    </>
  );
}

import { SearchSkeleton } from "@/app/components/search/search-skeleton";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";

export default async function SearchLoading() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <SectionFrame id="search" ariaLabelledBy="search-heading" padding="compact">
<PageHeader headingId="search-heading"
        eyebrow={dictionary.searchPage.eyebrow}
        title={dictionary.searchPage.title}
        description={dictionary.searchPage.description}
      />
      <SearchSkeleton />
    </SectionFrame>
  );
}

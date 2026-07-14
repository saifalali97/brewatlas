import { Star } from "lucide-react";
import { buildOwnerSectionMetadata, OwnerSectionPlaceholder } from "@/lib/owner/section-page";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const PATH = "/dashboard/reviews";

export async function generateMetadata() {
  const dictionary = await getDictionary(await getLocale());
  const s = dictionary.ownerSections;
  return buildOwnerSectionMetadata(PATH, s.reviewsTitle, s.reviewsDescription);
}

export default async function OwnerReviewsPage() {
  const dictionary = await getDictionary(await getLocale());
  const s = dictionary.ownerSections;
  return <OwnerSectionPlaceholder pathname={PATH} title={s.reviewsTitle} description={s.reviewsDescription} icon={Star} />;
}

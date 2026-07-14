import { Users } from "lucide-react";
import { buildOwnerSectionMetadata, OwnerSectionPlaceholder } from "@/lib/owner/section-page";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const PATH = "/dashboard/brewers";

export async function generateMetadata() {
  const dictionary = await getDictionary(await getLocale());
  const s = dictionary.ownerSections;
  return buildOwnerSectionMetadata(PATH, s.brewersTitle, s.brewersDescription);
}

export default async function OwnerBrewersPage() {
  const dictionary = await getDictionary(await getLocale());
  const s = dictionary.ownerSections;
  return <OwnerSectionPlaceholder pathname={PATH} title={s.brewersTitle} description={s.brewersDescription} icon={Users} />;
}

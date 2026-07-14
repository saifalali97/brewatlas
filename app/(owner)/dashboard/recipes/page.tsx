import { Coffee } from "lucide-react";
import { buildOwnerSectionMetadata, OwnerSectionPlaceholder } from "@/lib/owner/section-page";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const PATH = "/dashboard/recipes";

export async function generateMetadata() {
  const dictionary = await getDictionary(await getLocale());
  const s = dictionary.ownerSections;
  return buildOwnerSectionMetadata(PATH, s.recipesTitle, s.recipesDescription);
}

export default async function OwnerRecipesPage() {
  const dictionary = await getDictionary(await getLocale());
  const s = dictionary.ownerSections;
  return <OwnerSectionPlaceholder pathname={PATH} title={s.recipesTitle} description={s.recipesDescription} icon={Coffee} />;
}

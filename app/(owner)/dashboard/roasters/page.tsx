import { Store } from "lucide-react";
import { buildOwnerSectionMetadata, OwnerSectionPlaceholder } from "@/lib/owner/section-page";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const PATH = "/dashboard/roasters";

export async function generateMetadata() {
  const dictionary = await getDictionary(await getLocale());
  const s = dictionary.ownerSections;
  return buildOwnerSectionMetadata(PATH, s.roastersTitle, s.roastersDescription);
}

export default async function OwnerRoastersPage() {
  const dictionary = await getDictionary(await getLocale());
  const s = dictionary.ownerSections;
  return <OwnerSectionPlaceholder pathname={PATH} title={s.roastersTitle} description={s.roastersDescription} icon={Store} />;
}

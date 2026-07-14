import { FolderOpen } from "lucide-react";
import { buildOwnerSectionMetadata, OwnerSectionPlaceholder } from "@/lib/owner/section-page";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const PATH = "/dashboard/collections";

export async function generateMetadata() {
  const dictionary = await getDictionary(await getLocale());
  const s = dictionary.ownerSections;
  return buildOwnerSectionMetadata(PATH, s.collectionsTitle, s.collectionsDescription);
}

export default async function OwnerCollectionsPage() {
  const dictionary = await getDictionary(await getLocale());
  const s = dictionary.ownerSections;
  return <OwnerSectionPlaceholder pathname={PATH} title={s.collectionsTitle} description={s.collectionsDescription} icon={FolderOpen} />;
}

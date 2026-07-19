import type { GulfHeritageReference } from "@/types/gulf-heritage-reference";

/**
 * Arabic citation metadata keyed by English canonical URL.
 * Only entries with verified Arabic primary pages are listed; all others fall back to English in getUaePageReferences.
 */
export const UAE_REFERENCE_LOCALIZATION_AR: Record<string, Partial<GulfHeritageReference>> = {
  "https://abudhabiculture.ae/en/Cultural-Resources/Publications/Gahwa-Arabic-coffee": {
    sourceName: "القهوة العربية (Gahwa)",
    organization: "دائرة الثقافة والسياحة – أبوظبي",
    url: "https://abudhabiculture.ae/ar/Cultural-Resources/Publications/Gahwa-Arabic-coffee",
  },
  "https://abudhabiculture.ae/en/cultural-heritage/intangible/unesco-ich-inscribed-elements/gahwa-arabic-coffee": {
    sourceName: "القهوة العربية (Gahwa): عنصر مُدرج في قائمة اليونسكو",
    organization: "دائرة الثقافة والسياحة – أبوظبي",
    url: "https://abudhabiculture.ae/ar/cultural-heritage/intangible/unesco-ich-inscribed-elements/gahwa-arabic-coffee",
  },
  "https://abudhabiculture.ae/en/Cultural-Resources/Learning-Resources/Cultural-Heritage/Al-Gahwa": {
    sourceName: "دليل نشاط القهوة العربية",
    organization: "دائرة الثقافة والسياحة – أبوظبي",
    url: "https://abudhabiculture.ae/ar/Cultural-Resources/Learning-Resources/Cultural-Heritage/Al-Gahwa",
  },
  "https://abudhabiculture.ae/en/cultural-programmes/cultural-platforms/bait-al-gahwa": {
    sourceName: "منصة بيت القهوة الثقافية",
    organization: "دائرة الثقافة والسياحة – أبوظبي",
    url: "https://abudhabiculture.ae/ar/cultural-programmes/cultural-platforms/bait-al-gahwa",
  },
  "https://www.visitdubai.com/en/articles/top-karak-chai-spots": {
    sourceName: "أفضل الوجهات التي تقدّم شاي الكرك في دبي",
    organization: "دائرة الاقتصاد والسياحة في دبي (زوروا دبي)",
    url: "https://www.visitdubai.com/ar/articles/top-karak-chai-spots",
  },
  "https://fillicafe.com/what-is-zafran-chai": {
    sourceName: "ما هو شاي الزعفران — كرك الزعفران من فيلي",
    organization: "فيلي كافيه",
    url: "https://fillicafe.com/ar/what-is-zafran-chai",
  },
  "https://fillicafe.com/menu/signature-chai": {
    sourceName: "قائمة فيلي — الشاي المميز",
    organization: "فيلي كافيه",
    url: "https://fillicafe.com/ar/menu/signature-chai",
  },
  "https://fillicafe.com/tea-house-dubai": {
    sourceName: "Tea House Dubai — فيلي، موطن الكرك والشاي",
    organization: "فيلي كافيه",
    url: "https://fillicafe.com/ar/tea-house-dubai",
  },
};

export function getUaeReferenceLocalizationAr(url: string | null): Partial<GulfHeritageReference> | undefined {
  if (!url) return undefined;
  return UAE_REFERENCE_LOCALIZATION_AR[url];
}

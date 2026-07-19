import type { GulfHeritageArabicCoffeePageSlug, GulfHeritageTeaKarakPageSlug } from "@/types/gulf-heritage";
import type { Locale } from "@/types/i18n";
import { DEFAULT_LOCALE } from "@/types/i18n";
import { localizeGulfHeritageArticleContent } from "@/lib/content/gulf-heritage/localize";
import { getUaeArticleContentAr } from "@/lib/content/gulf-heritage/uae/article-content.ar";
import type { GulfHeritageArticleContent } from "@/types/gulf-heritage-article-content";
import {
  ARAB_AMERICA_ADANI,
  ARAB_AMERICA_ADANI_HISTORY,
  DCT_AL_GAHWA_GUIDE,
  DCT_GAHWA_OVERVIEW,
  DCT_GAHWA_PREPARATION,
  DCT_GAHWA_TRADITIONS,
  DCT_GAHWA_UTENSILS,
  FILLI_MINT_MENU,
  FILLI_ZAFRAN,
  GAHWA_GLOSSARY,
  GULF_NEWS_GAHWA_HOSPITALITY,
  GULF_NEWS_GAHWA_PREP,
  GULF_NEWS_THREE_POT,
  KARAK_GLOSSARY,
  SMITHSONIAN_KARAK_CULTURE,
  SMITHSONIAN_KARAK_HISTORY,
  SMITHSONIAN_KARAK_INGREDIENTS,
  SMITHSONIAN_KARAK_PREP,
  SMITHSONIAN_KARAK_SERVING,
  UNESCO_GAHWA_ETIQUETTE,
  UNESCO_GAHWA_GENEROSITY,
  VISIT_DUBAI_KARAK,
} from "@/lib/content/gulf-heritage/uae/verified-passages";

/** Editorial section content per UAE article page — sourced from verified-passages.ts only. */
export const UAE_ARTICLE_CONTENT: Record<
  GulfHeritageArabicCoffeePageSlug | GulfHeritageTeaKarakPageSlug,
  GulfHeritageArticleContent
> = {
  "emirati-arabic-coffee": {
    variant: "arabic-coffee",
    intro:
      "Arabic coffee ('Gahwa' in the Emirati Arabic dialect) has been a central part of Arab culture for centuries and its preparation and serving is marked by elaborate traditions.",
    glossary: GAHWA_GLOSSARY,
    sections: {
      overview: DCT_GAHWA_OVERVIEW,
      history:
        "Arabic coffee was inscribed in 2015 on the UNESCO Representative List of the Intangible Cultural Heritage of Humanity. The United Arab Emirates applied with Saudi Arabia, Oman and Qatar to have it inscribed.",
      culturalSignificance: `${UNESCO_GAHWA_GENEROSITY} ${DCT_AL_GAHWA_GUIDE}`,
      traditionalPreparation: DCT_GAHWA_PREPARATION,
      regionalDifferences: null,
      servingEtiquette: `${DCT_GAHWA_TRADITIONS} ${UNESCO_GAHWA_ETIQUETTE}`,
      equipment: DCT_GAHWA_UTENSILS,
      ingredients:
        "Dallat al-khumrah is described as a large pot for boiling coffee and cardamom. At Sharjah Heritage Days, Mohammad Ahmad Al Tamimi adds a dash of saffron and cardamom after brewing; occasionally, rose water is added to enhance the aroma.",
    },
  },
  dallah: {
    variant: "arabic-coffee",
    intro:
      "The dallah or coffee pot is an important utensil in the coffee-making process. Specially designed and decorated, there are three types of dallah in the preparation and serving of Arabic coffee.",
    glossary:
      "Dallah — coffee pot used in gahwa preparation and serving. Dallat al-khumrah — large pot for boiling coffee and cardamom. Dallat al-talgeemah — medium-sized pot for filtering the coffee. Dallat al-mazalah — small pot from which the coffee is served.",
    sections: {
      overview:
        "The dallah or coffee pot is an important utensil in the coffee-making process. Specially designed and decorated, there are three types of dallah in the preparation and serving of Arabic coffee.",
      history: null,
      culturalSignificance: DCT_GAHWA_OVERVIEW,
      traditionalPreparation: GULF_NEWS_THREE_POT,
      regionalDifferences: null,
      servingEtiquette: DCT_GAHWA_TRADITIONS,
      equipment: DCT_GAHWA_UTENSILS,
      ingredients: null,
    },
  },
  finjan: {
    variant: "arabic-coffee",
    intro:
      "The finjal is the small cup from which Arabic coffee is served. Etiquette for the guest dictates they must use the right hand to receive and return the cup to the server.",
    glossary: "Finjal — small cup from which Arabic coffee is served.",
    sections: {
      overview:
        "The finjal is the small cup from which Arabic coffee is served. Etiquette for the guest dictates they must use the right hand to receive and return the cup to the server.",
      history: null,
      culturalSignificance: DCT_AL_GAHWA_GUIDE,
      traditionalPreparation: null,
      regionalDifferences: null,
      servingEtiquette: `${DCT_GAHWA_TRADITIONS} ${UNESCO_GAHWA_ETIQUETTE}`,
      equipment: "The server holds the cup (finjal) with the right hand while pouring from the dallah.",
      ingredients: null,
    },
  },
  mihmas: {
    variant: "arabic-coffee",
    intro:
      "Coffee-making tools are collectively called the ma`ameel (brew basket). The mihmas is a spoon for stirring beans during roasting.",
    glossary: "Mihmas — spoon for stirring beans during roasting. Ma`ameel — collective term for coffee-making tools.",
    sections: {
      overview:
        "Coffee-making tools are collectively called the ma`ameel (brew basket). The mihmas is a spoon for stirring beans during roasting.",
      history: null,
      culturalSignificance: DCT_GAHWA_PREPARATION,
      traditionalPreparation: GULF_NEWS_GAHWA_PREP,
      regionalDifferences: null,
      servingEtiquette: null,
      equipment: DCT_GAHWA_UTENSILS,
      ingredients: null,
    },
  },
  cardamom: {
    variant: "arabic-coffee",
    intro: null,
    glossary: null,
    sections: {
      overview:
        "Dallat al-khumrah is a large pot for boiling coffee and cardamom. Cardamom is part of the traditional gahwa preparation described in Emirati heritage sources.",
      history: null,
      culturalSignificance: null,
      traditionalPreparation: GULF_NEWS_GAHWA_PREP,
      regionalDifferences: null,
      servingEtiquette: null,
      equipment: null,
      ingredients:
        "A dash of saffron and cardamom are added after brewing to balance the high-intense, full-bodied flavour of the beverage.",
    },
  },
  saffron: {
    variant: "arabic-coffee",
    intro: null,
    glossary: null,
    sections: {
      overview:
        "At Sharjah Heritage Days, veteran coffee maker Mohammad Ahmad Al Tamimi adds a dash of saffron and cardamom after brewing Arabic coffee.",
      history: null,
      culturalSignificance: null,
      traditionalPreparation: GULF_NEWS_GAHWA_PREP,
      regionalDifferences: null,
      servingEtiquette: null,
      equipment: null,
      ingredients:
        "A dash of saffron and cardamom are added after brewing to balance the high-intense, full-bodied flavour of the beverage. Occasionally, rose water is added to enhance the aroma.",
    },
  },
  "coffee-hospitality": {
    variant: "arabic-coffee",
    intro: UNESCO_GAHWA_GENEROSITY,
    glossary: "Majlis — gathering space where gahwa is served as a symbol of generosity and welcome.",
    sections: {
      overview: UNESCO_GAHWA_GENEROSITY,
      history: null,
      culturalSignificance: `${DCT_GAHWA_OVERVIEW} ${GULF_NEWS_GAHWA_HOSPITALITY}`,
      traditionalPreparation: null,
      regionalDifferences: null,
      servingEtiquette: DCT_AL_GAHWA_GUIDE,
      equipment: null,
      ingredients: null,
    },
  },
  "coffee-etiquette": {
    variant: "arabic-coffee",
    intro: UNESCO_GAHWA_ETIQUETTE,
    glossary:
      "Finjal — small serving cup. Dallah — coffee pot; server holds it with the left hand, thumb pointing to the top, while holding the finjal with the right hand.",
    sections: {
      overview: UNESCO_GAHWA_ETIQUETTE,
      history: null,
      culturalSignificance: DCT_AL_GAHWA_GUIDE,
      traditionalPreparation: null,
      regionalDifferences: null,
      servingEtiquette: DCT_GAHWA_TRADITIONS,
      equipment: null,
      ingredients: null,
    },
  },
  "coffee-serving-traditions": {
    variant: "arabic-coffee",
    intro: DCT_GAHWA_TRADITIONS,
    glossary: GAHWA_GLOSSARY,
    sections: {
      overview: DCT_GAHWA_TRADITIONS,
      history: null,
      culturalSignificance: DCT_AL_GAHWA_GUIDE,
      traditionalPreparation: DCT_GAHWA_PREPARATION,
      regionalDifferences: null,
      servingEtiquette: `${DCT_GAHWA_TRADITIONS} ${UNESCO_GAHWA_ETIQUETTE}`,
      equipment: `${DCT_GAHWA_UTENSILS} ${GULF_NEWS_THREE_POT}`,
      ingredients: null,
    },
  },
  "karak-chai": {
    variant: "tea-karak",
    intro:
      "Chai karak, or simply karak, has become a beloved staple of the Khaleej (Arabian Peninsula), to be consumed at any time of day.",
    glossary: KARAK_GLOSSARY,
    sections: {
      history: SMITHSONIAN_KARAK_HISTORY,
      ingredients: `${VISIT_DUBAI_KARAK} ${SMITHSONIAN_KARAK_INGREDIENTS}`,
      traditionalPreparation: SMITHSONIAN_KARAK_PREP,
      servingTraditions: `${SMITHSONIAN_KARAK_CULTURE} ${SMITHSONIAN_KARAK_SERVING}`,
      regionalVariations: null,
    },
  },
  "black-tea": {
    variant: "tea-karak",
    intro: null,
    glossary: null,
    sections: {
      history: SMITHSONIAN_KARAK_HISTORY,
      ingredients: `${VISIT_DUBAI_KARAK} A strong black tea is the base for chai karak.`,
      traditionalPreparation: null,
      servingTraditions: SMITHSONIAN_KARAK_CULTURE,
      regionalVariations: null,
    },
  },
  "milk-tea": {
    variant: "tea-karak",
    intro: null,
    glossary: null,
    sections: {
      history: SMITHSONIAN_KARAK_HISTORY,
      ingredients: `${VISIT_DUBAI_KARAK} Chai karak is finished with a creaminess that can come from evaporated or condensed milk.`,
      traditionalPreparation: null,
      servingTraditions: null,
      regionalVariations: null,
    },
  },
  "saffron-tea": {
    variant: "tea-karak",
    intro: null,
    glossary: null,
    sections: {
      history: SMITHSONIAN_KARAK_HISTORY,
      ingredients: `${FILLI_ZAFRAN} ${VISIT_DUBAI_KARAK}`,
      traditionalPreparation:
        "As an option, add a few sprigs of saffron either to the carafe/teapot or the tea glasses when serving chai karak.",
      servingTraditions: SMITHSONIAN_KARAK_CULTURE,
      regionalVariations: null,
    },
  },
  "mint-tea": {
    variant: "tea-karak",
    intro: null,
    glossary: null,
    sections: {
      history: null,
      ingredients: FILLI_MINT_MENU,
      traditionalPreparation: null,
      servingTraditions: null,
      regionalVariations: null,
    },
  },
  "adani-tea": {
    variant: "tea-karak",
    intro: null,
    glossary: null,
    sections: {
      history: ARAB_AMERICA_ADANI_HISTORY,
      ingredients: ARAB_AMERICA_ADANI,
      traditionalPreparation: null,
      servingTraditions: null,
      regionalVariations: null,
    },
  },
};

export function getUaeArticleContent(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): GulfHeritageArticleContent | null {
  if (!(slug in UAE_ARTICLE_CONTENT)) return null;

  const english = UAE_ARTICLE_CONTENT[slug as keyof typeof UAE_ARTICLE_CONTENT];
  const arabic = getUaeArticleContentAr(slug);
  return localizeGulfHeritageArticleContent(locale, english, arabic);
}

import type { GulfHeritageArabicCoffeePageSlug, GulfHeritageTeaKarakPageSlug } from "@/types/gulf-heritage";
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
  GULF_NEWS_GAHWA_HOSPITALITY,
  GULF_NEWS_GAHWA_PREP,
  GULF_NEWS_THREE_POT,
  SMITHSONIAN_KARAK_CULTURE,
  SMITHSONIAN_KARAK_HISTORY,
  SMITHSONIAN_KARAK_INGREDIENTS,
  SMITHSONIAN_KARAK_PREP,
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
    sections: {
      overview:
        "The finjal is the small cup from which Arabic coffee is served. Etiquette for the guest dictates they must use the right hand to receive and return the cup to the server.",
      history: null,
      culturalSignificance: null,
      traditionalPreparation: null,
      regionalDifferences: null,
      servingEtiquette: `${DCT_GAHWA_TRADITIONS} ${UNESCO_GAHWA_ETIQUETTE}`,
      equipment: "The server holds the cup (finjal) with the right hand while pouring from the dallah.",
      ingredients: null,
    },
  },
  mihmas: {
    variant: "arabic-coffee",
    sections: {
      overview:
        "Coffee-making tools are collectively called the ma`ameel (brew basket). The mihmas is a spoon for stirring beans during roasting.",
      history: null,
      culturalSignificance: null,
      traditionalPreparation: GULF_NEWS_GAHWA_PREP,
      regionalDifferences: null,
      servingEtiquette: null,
      equipment: DCT_GAHWA_UTENSILS,
      ingredients: null,
    },
  },
  cardamom: {
    variant: "arabic-coffee",
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
    sections: {
      history: SMITHSONIAN_KARAK_HISTORY,
      ingredients: `${VISIT_DUBAI_KARAK} ${SMITHSONIAN_KARAK_INGREDIENTS}`,
      traditionalPreparation: SMITHSONIAN_KARAK_PREP,
      servingTraditions: SMITHSONIAN_KARAK_CULTURE,
      regionalVariations: null,
    },
  },
  "black-tea": {
    variant: "tea-karak",
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
): GulfHeritageArticleContent | null {
  if (slug in UAE_ARTICLE_CONTENT) {
    return UAE_ARTICLE_CONTENT[slug as keyof typeof UAE_ARTICLE_CONTENT];
  }
  return null;
}

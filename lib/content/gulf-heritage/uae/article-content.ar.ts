import type { GulfHeritageArabicCoffeePageSlug, GulfHeritageTeaKarakPageSlug } from "@/types/gulf-heritage";
import type { GulfHeritageArticleContent } from "@/types/gulf-heritage-article-content";
import {
  DCT_GAHWA_OVERVIEW_AR,
  DCT_GAHWA_PREPARATION_AR,
  DCT_GAHWA_TRADITIONS_AR,
  DCT_GAHWA_UTENSILS_AR,
  FILLI_KARAK_DUBAI_AR,
  FILLI_KARAK_ORIGIN_AR,
  FILLI_KARAK_OVERVIEW_AR,
  FILLI_MINT_MENU_AR,
  FILLI_SAFFRON_PREP_AR,
  FILLI_ZAFRAN_AR,
  GAHWA_GLOSSARY_AR,
  KARAK_GLOSSARY_AR,
  SMITHSONIAN_KARAK_CULTURE_AR,
  SMITHSONIAN_KARAK_HISTORY_AR,
  SMITHSONIAN_KARAK_INGREDIENTS_AR,
  SMITHSONIAN_KARAK_PREP_AR,
  SMITHSONIAN_KARAK_SERVING_AR,
  VISIT_DUBAI_KARAK_AR,
} from "@/lib/content/gulf-heritage/uae/verified-passages.ar";

/** Arabic editorial sections — sourced from verified-passages.ar.ts only. Missing pages fall back to English in getUaeArticleContent. */
export const UAE_ARTICLE_CONTENT_AR: Partial<
  Record<GulfHeritageArabicCoffeePageSlug | GulfHeritageTeaKarakPageSlug, GulfHeritageArticleContent>
> = {
  "emirati-arabic-coffee": {
    variant: "arabic-coffee",
    intro:
      "تشكل القهوة العربية منذ قرون بعيدة ركناً أساسياً في بنية الثقافة العربية، وتتميز طريقة تحضيرها وتقديمها بتقاليد وطقوس مُتقَنة.",
    glossary: GAHWA_GLOSSARY_AR,
    sections: {
      overview: DCT_GAHWA_OVERVIEW_AR,
      history:
        "أُدرجت القهوة العربية عام 2015 ضمن القائمة التمثيلية للتراث الثقافي غير المادي للبشرية في منظمة اليونسكو. تقدمت الإمارات العربية المتحدة والسعودية وعُمان وقطر بطلب الإدراج.",
      culturalSignificance: DCT_GAHWA_OVERVIEW_AR,
      traditionalPreparation: DCT_GAHWA_PREPARATION_AR,
      regionalDifferences: null,
      servingEtiquette: DCT_GAHWA_TRADITIONS_AR,
      equipment: DCT_GAHWA_UTENSILS_AR,
      ingredients:
        "دلّة الخُمرة وعاء كبير لغلي القهوة والهيل. يُضاف الهيل والزعفران أحياناً بعد التحضير لتعزيز النكهة والشذى.",
    },
  },
  dallah: {
    variant: "arabic-coffee",
    intro:
      "إن دلّة القهوة العربية أهم الأدوات المستخدمة في عملية تحضير القهوة وتقديمها. تُصمم الدلة وتُزين بطريقة خاصة، وتوجد منها ثلاثة أنواع.",
    glossary:
      "الدلة — وعاء القهوة المستخدم في تحضير وتقديم القهوة. دلّة الخُمرة — وعاء كبير لغلي القهوة والهيل. دلّة التلقيمة — وعاء متوسط الحجم لتصفية القهوة. دلّة المزلة — الدلة الصغرى المُستخدمة في تقديم القهوة.",
    sections: {
      overview:
        "إن دلّة القهوة العربية أهم الأدوات المستخدمة في عملية تحضير القهوة وتقديمها. تُصمم الدلة وتُزين بطريقة خاصة، وتوجد منها ثلاثة أنواع.",
      history: null,
      culturalSignificance: DCT_GAHWA_OVERVIEW_AR,
      traditionalPreparation: DCT_GAHWA_UTENSILS_AR,
      regionalDifferences: null,
      servingEtiquette: DCT_GAHWA_TRADITIONS_AR,
      equipment: DCT_GAHWA_UTENSILS_AR,
      ingredients: null,
    },
  },
  finjan: {
    variant: "arabic-coffee",
    intro:
      "الفنجان هو الكوب الصغير الذي تُقدَّم فيه القهوة العربية. ومن آداب الضيف استخدام يده اليمنى لتناول الفنجان وإعادته إلى من قدمه إليه.",
    glossary: "الفنجان — الكوب الصغير الذي تُقدَّم فيه القهوة العربية.",
    sections: {
      overview:
        "الفنجان هو الكوب الصغير الذي تُقدَّم فيه القهوة العربية. ومن آداب الضيف استخدام يده اليمنى لتناول الفنجان وإعادته إلى من قدمه إليه.",
      history: null,
      culturalSignificance: DCT_GAHWA_OVERVIEW_AR,
      traditionalPreparation: null,
      regionalDifferences: null,
      servingEtiquette: DCT_GAHWA_TRADITIONS_AR,
      equipment: "يجب على من يصب القهوة حمل الدلة بيده اليسرى وحمل الفنجان بيده اليمنى.",
      ingredients: null,
    },
  },
  mihmas: {
    variant: "arabic-coffee",
    intro:
      "يُطلق على الأدوات المستخدمة لتحضير القهوة مجتمعةً «المعاميل». والمحماس ملعقة لتقليب حبوب البن أثناء التحميص.",
    glossary: "المحماس — ملعقة لتقليب حبوب البن أثناء التحميص. المعاميل — اسم جماعي لأدوات تحضير القهوة.",
    sections: {
      overview:
        "يُطلق على الأدوات المستخدمة لتحضير القهوة مجتمعةً «المعاميل». والمحماس ملعقة لتقليب حبوب البن أثناء التحميص.",
      history: null,
      culturalSignificance: DCT_GAHWA_PREPARATION_AR,
      traditionalPreparation: DCT_GAHWA_PREPARATION_AR,
      regionalDifferences: null,
      servingEtiquette: null,
      equipment: DCT_GAHWA_UTENSILS_AR,
      ingredients: null,
    },
  },
  cardamom: {
    variant: "arabic-coffee",
    intro: null,
    glossary: null,
    sections: {
      overview: "دلّة الخُمرة وعاء كبير لغلي القهوة والهيل. يُعد الهيل جزءاً من تحضير القهوة العربية في المصادر التراثية الإماراتية.",
      history: null,
      culturalSignificance: null,
      traditionalPreparation: DCT_GAHWA_PREPARATION_AR,
      regionalDifferences: null,
      servingEtiquette: null,
      equipment: null,
      ingredients: "يُستخدم الهيل في غلي القهوة داخل دلّة الخُمرة.",
    },
  },
  saffron: {
    variant: "arabic-coffee",
    intro: null,
    glossary: null,
    sections: {
      overview: "يُضاف الزعفران والهيل أحياناً بعد التحضير لتعزيز نكهة القهوة العربية وشذاها.",
      history: null,
      culturalSignificance: null,
      traditionalPreparation: DCT_GAHWA_PREPARATION_AR,
      regionalDifferences: null,
      servingEtiquette: null,
      equipment: null,
      ingredients: "يُضاف الزعفران والهيل أحياناً بعد التحضير لتعزيز النكهة والشذى.",
    },
  },
  "coffee-hospitality": {
    variant: "arabic-coffee",
    intro: DCT_GAHWA_OVERVIEW_AR,
    glossary: "المجلس — مكان التجمع حيث تُقدَّم القهوة رمزاً للكرم والترحيب.",
    sections: {
      overview: DCT_GAHWA_OVERVIEW_AR,
      history: null,
      culturalSignificance: DCT_GAHWA_OVERVIEW_AR,
      traditionalPreparation: null,
      regionalDifferences: null,
      servingEtiquette: DCT_GAHWA_TRADITIONS_AR,
      equipment: null,
      ingredients: null,
    },
  },
  "coffee-etiquette": {
    variant: "arabic-coffee",
    intro: DCT_GAHWA_TRADITIONS_AR,
    glossary:
      "الفنجان — الكوب الصغير للتقديم. الدلة — يحملها من يصب القهوة بيده اليسرى مع توجيه الإبهام إلى أعلى، ويحمل الفنجان بيده اليمنى.",
    sections: {
      overview: DCT_GAHWA_TRADITIONS_AR,
      history: null,
      culturalSignificance: DCT_GAHWA_OVERVIEW_AR,
      traditionalPreparation: null,
      regionalDifferences: null,
      servingEtiquette: DCT_GAHWA_TRADITIONS_AR,
      equipment: null,
      ingredients: null,
    },
  },
  "coffee-serving-traditions": {
    variant: "arabic-coffee",
    intro: DCT_GAHWA_TRADITIONS_AR,
    glossary: GAHWA_GLOSSARY_AR,
    sections: {
      overview: DCT_GAHWA_TRADITIONS_AR,
      history: null,
      culturalSignificance: DCT_GAHWA_OVERVIEW_AR,
      traditionalPreparation: DCT_GAHWA_PREPARATION_AR,
      regionalDifferences: null,
      servingEtiquette: DCT_GAHWA_TRADITIONS_AR,
      equipment: DCT_GAHWA_UTENSILS_AR,
      ingredients: null,
    },
  },
  "karak-chai": {
    variant: "tea-karak",
    intro: FILLI_KARAK_OVERVIEW_AR,
    glossary: KARAK_GLOSSARY_AR,
    sections: {
      history: SMITHSONIAN_KARAK_HISTORY_AR,
      ingredients: `${VISIT_DUBAI_KARAK_AR} ${SMITHSONIAN_KARAK_INGREDIENTS_AR}`,
      traditionalPreparation: SMITHSONIAN_KARAK_PREP_AR,
      servingTraditions: `${SMITHSONIAN_KARAK_CULTURE_AR} ${SMITHSONIAN_KARAK_SERVING_AR}`,
      regionalVariations: FILLI_KARAK_DUBAI_AR,
    },
  },
  "black-tea": {
    variant: "tea-karak",
    intro: null,
    glossary: null,
    sections: {
      history: SMITHSONIAN_KARAK_HISTORY_AR,
      ingredients: `${VISIT_DUBAI_KARAK_AR} يُعد الشاي الأسود القوي قاعدة الكرك.`,
      traditionalPreparation: null,
      servingTraditions: SMITHSONIAN_KARAK_CULTURE_AR,
      regionalVariations: null,
    },
  },
  "milk-tea": {
    variant: "tea-karak",
    intro: null,
    glossary: null,
    sections: {
      history: SMITHSONIAN_KARAK_HISTORY_AR,
      ingredients: `${VISIT_DUBAI_KARAK_AR} يُنهى الكرك بقوام كريمي من الحليب المُتبخّر أو المُكثّف.`,
      traditionalPreparation: null,
      servingTraditions: null,
      regionalVariations: null,
    },
  },
  "saffron-tea": {
    variant: "tea-karak",
    intro: null,
    glossary: KARAK_GLOSSARY_AR,
    sections: {
      history: SMITHSONIAN_KARAK_HISTORY_AR,
      ingredients: `${FILLI_ZAFRAN_AR} ${VISIT_DUBAI_KARAK_AR}`,
      traditionalPreparation: FILLI_SAFFRON_PREP_AR,
      servingTraditions: SMITHSONIAN_KARAK_CULTURE_AR,
      regionalVariations: FILLI_KARAK_ORIGIN_AR,
    },
  },
  "mint-tea": {
    variant: "tea-karak",
    intro: null,
    glossary: null,
    sections: {
      history: null,
      ingredients: FILLI_MINT_MENU_AR,
      traditionalPreparation: null,
      servingTraditions: null,
      regionalVariations: null,
    },
  },
  // adani-tea: no entry — verified Arabic passages do not exist in verified-passages.ar.ts;
  // history and ingredients fall back to English (Arab America, english-only source).
};

export function getUaeArticleContentAr(
  slug: string,
): GulfHeritageArticleContent | null {
  if (slug in UAE_ARTICLE_CONTENT_AR) {
    return UAE_ARTICLE_CONTENT_AR[slug as keyof typeof UAE_ARTICLE_CONTENT_AR] ?? null;
  }
  return null;
}

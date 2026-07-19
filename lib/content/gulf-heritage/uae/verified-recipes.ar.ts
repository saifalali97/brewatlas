import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageReference } from "@/types/gulf-heritage-reference";

const SMITHSONIAN_KARAK_REF_AR: GulfHeritageReference = {
  sourceName: "وصفات إماراتية: شاي الكرك والشبّاب",
  organization: "مؤسسة Smithsonian (مهرجان Smithsonian Folklife Festival)",
  publication: "Kathy Phung (2022)",
  url: "https://festival.si.edu/blog/emirati-recipes-chai-karak-and-chbaab",
  retrievedDate: "2026-07-19",
  type: "official-company",
};

/** Arabic karak recipe — steps sourced from verified-passages.ar.ts (Smithsonian Folklife Festival). */
export const SMITHSONIAN_KARAK_CHAI_RECIPE_AR: Partial<GulfHeritageRecipeReference> = {
  preparationTime: "حوالي 20 دقيقة",
  servingSize: "3 أكواب (700 مل)",
  equipmentList: ["قدر متوسط", "مصفاة", "إبريق حراري أو إبريق شاي", "أكواب شاي صغيرة أو فناجين"],
  ingredientsList: [
    { name: "ماء ساخن", amount: "3", unit: "أكواب (700 مل)", notes: null },
    { name: "حبوب هيل، مطحونة", amount: "6", unit: "حبات", notes: null },
    {
      name: "شاي أسود ورقي",
      amount: "3–4",
      unit: "ملاعق صغيرة",
      notes: "إذا استخدمت أكياس الشاي، افتح الكيس واستخدم الشاي الورقي.",
    },
    { name: "حليب مُتبخّر", amount: "3/4", unit: "كوب (180 مل)", notes: null },
    { name: "سكر", amount: "2", unit: "ملاعق كبيرة", notes: "عدّل حسب الذوق" },
    { name: "زعفران", amount: "1", unit: "رشة", notes: "اختياري" },
  ],
  steps: [
    {
      order: 1,
      instruction: "اخلط الماء وحبوب الهيل والشاي الأسود في قدر متوسط.",
      image: null,
      duration: null,
    },
    {
      order: 2,
      instruction:
        "اترك الخليط يغلي على نار عالية لمدة 5 إلى 8 دقائق أو حتى يصبح عطرياً مع التحريك بانتظام.",
      image: null,
      duration: "5–8 دقائق",
    },
    {
      order: 3,
      instruction:
        "خفّض النار إلى متوسطة وأضف الحليب والسكر حسب الذوق. زِد كمية الحليب لشاي أكثر كثافة. حرّك الكرك حتى يسخن جيداً دون أن يغلي الحليب.",
      image: null,
      duration: null,
    },
    {
      order: 4,
      instruction: "ارفع القدر عن النار، غطّه، واتركه ينقع لمدة 5 دقائق.",
      image: null,
      duration: "5 دقائق",
    },
    {
      order: 5,
      instruction:
        "صفّ الكرك في إبريق حراري أو إبريق شاي. يمكن إضافة بعض خيوط الزعفران اختيارياً إلى الإبريق أو أكواب الشاي.",
      image: null,
      duration: null,
    },
    {
      order: 6,
      instruction: "قدّم ساخناً في أكواب شاي صغيرة.",
      image: null,
      duration: null,
    },
  ],
  tips: [
    "زِد كمية الحليب لشاي أكثر كثافة.",
    "أضف بعض خيوط الزعفران إلى الإبريق أو أكواب الشاي لنسخة كرك بالزعفران.",
  ],
  notes:
    "وصفة من تأليف Ahmed Al Bawardi و Hanan Sayed Worrell، من كتاب Table Tales: The Global Nomad Cuisine of Abu Dhabi (Rizzoli, 2018)، أُعيد نشرها على مدونة مهرجان Smithsonian Folklife Festival (2022).",
  warnings: ["لا تدع الحليب يغلي بعد إضافته."],
  references: [SMITHSONIAN_KARAK_REF_AR],
  country: "الإمارات العربية المتحدة",
  yield: "3 أكواب (700 مل)",
  brewMethod: "طبخ على الموقد",
  waterTemperature: "نار عالية لغلي الماء والشاي؛ نار متوسطة لتسخين الحليب دون الغليان",
  time: "حوالي 20 دقيقة",
  servingNotes: "قدّم ساخناً في أكواب شاي صغيرة.",
  method: "موقد",
  water: "3 أكواب (700 مل)",
  verification: {
    status: "verified",
    sourceName: "مهرجان Smithsonian Folklife Festival",
    sourceUrl: "https://festival.si.edu/blog/emirati-recipes-chai-karak-and-chbaab",
    originalAuthor: "Ahmed Al Bawardi and Hanan Sayed Worrell",
    publication: "Table Tales: The Global Nomad Cuisine of Abu Dhabi (Rizzoli, 2018)",
    publishedDate: "2022",
    lastVerified: "2026-07-19",
    recipeVersion: "1.0",
  },
};

export const UAE_VERIFIED_RECIPES_AR: Record<string, Partial<GulfHeritageRecipeReference>> = {
  "smithsonian-karak-chai": SMITHSONIAN_KARAK_CHAI_RECIPE_AR,
};

export function getUaeVerifiedRecipeAr(slug: string): Partial<GulfHeritageRecipeReference> | undefined {
  return UAE_VERIFIED_RECIPES_AR[slug];
}

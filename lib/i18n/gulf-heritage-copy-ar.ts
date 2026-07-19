/** Arabic page titles and SEO for Gulf Heritage — no unverified editorial body copy. */

function pageSeo(title: string, topic: string) {
  return `استكشف ${title} في الإمارات — دليل BrewAtlas لـ${topic}، يُنشر فقط من مصادر موثّقة.`;
}

function verifiedSeo(title: string, sources: string, topic: string) {
  return `${title} في الإمارات — دليل تراث الخليج الموثّق من ${sources}. ${topic}`;
}

function ghPage(title: string, seoTitle: string, seoDescription: string, intro: string | null = null) {
  return { title, intro, seoTitle, seoDescription };
}

export const gulfHeritageCategoriesAr = {
  "arabic-coffee": {
    title: "القهوة العربية",
    description: "أدلة حول موضوعات القهوة العربية في الإمارات. يُضاف المحتوى بعد التحقق من المصادر.",
    seoTitle: "القهوة العربية | تراث الخليج — الإمارات",
    seoDescription: pageSeo("القهوة العربية", "القهوة والضيافة وتقاليد التقديم"),
  },
  "tea-karak": {
    title: "الشاي والكرak",
    description: "أدلة حول الشاي والكرak في الإمارات. يُضاف المحتوى بعد التحقق من المصادر.",
    seoTitle: "الشاي والكرak | تراث الخليج — الإمارات",
    seoDescription: pageSeo("الشاي والكرak", "الكرak والشاي في الثقافة الخليجية"),
  },
  "uae-roasters": {
    title: "محمصات الإمارات المتخصصة",
    description: "ملفات محمصات مشهد القهوة المتخصصة في الإمارات. تُضاف التفاصيل بعد التحقق من المصادر.",
    seoTitle: "محمصات الإمارات المتخصصة | تراث الخليج",
    seoDescription: pageSeo("محمصات الإمارات", "التحميص والأصول وتوصيات التحضير"),
  },
} as const;

export const gulfHeritagePagesAr = {
  "emirati-arabic-coffee": ghPage(
    "القهوة العربية الإماراتية",
    "القهوة العربية الإماراتية (القهوة) | تراث اليونسكو | تراث الخليج",
    verifiedSeo(
      "القهوة العربية الإماراتية",
      "دائرة الثقافة والسياحة – أبوظبي واليونسكو",
      "التحضير والضيافة وآداب التقديم والأهمية الثقافية للقهوة.",
    ),
  ),
  dallah: ghPage(
    "الدلة",
    "دلة القهوة العربية | تراث القهوة الإماراتية",
    verifiedSeo("الدلة", "دائرة الثقافة والسياحة – أبوظبي وخليج نيوز", "ثلاثة أنواع من أواني القهوة للغلي والتصفية والتقديم."),
  ),
  finjan: ghPage(
    "الفنجان",
    "الفنجان (فنجان القهوة العربية) | تراث الخليج — الإمارات",
    verifiedSeo("الفنجان", "دائرة الثقافة والسياحة – أبوظبي واليونسكو", "الفنجان الصغير وآداب الضيف وتقاليد التقديم."),
  ),
  mihmas: ghPage(
    "المحمّص",
    "المحمّص (ملعقة التحميص) | تراث الخليج — الإمارات",
    verifiedSeo("المحمّص", "دائرة الثقافة والسياحة – أبوظبي وخليج نيوز", "أدوات تحميص القهوة التقليدية ومعدات المعامل."),
  ),
  cardamom: ghPage("الهيل", "الهيل في القهوة العربية | تراث الخليج — الإمارات", pageSeo("الهيل", "الهيل في القهوة العربية")),
  saffron: ghPage("الزعفران", "الزعفران في القهوة العربية | تراث الخليج — الإمارات", pageSeo("الزعفران", "الزعفران في القهوة")),
  "coffee-hospitality": ghPage(
    "ضيافة القهوة",
    "ضيافة القهوة العربية والكرم | تراث الخليج — الإمارات",
    verifiedSeo("ضيافة القهوة العربية", "اليونسكو ودائرة الثقافة – أبوظبي", "الكرم والمجلس ودور القهوة في الترحيب الإماراتي."),
  ),
  "coffee-etiquette": ghPage(
    "آداب القهوة",
    "آداب القهوة العربية | اليونسكو ودCT | تراث الخليج",
    verifiedSeo("آداب القهوة العربية", "اليونسكو ودائرة الثقافة – أبوظبي", "آداب الضيف والمضيف وإشارات الفنجان وترتيب التقديم."),
  ),
  "coffee-serving-traditions": ghPage(
    "تقاليد تقديم القهوة",
    "تقاليد تقديم القهوة (القهوة) | تراث الخليج — الإمارات",
    verifiedSeo("تقاليد تقديم القهوة", "دائرة الثقافة – أبوظبي واليونسكو", "كيف تُسكب القهوة وتُعاد تعبئتها وتُقدَّم في المناسبات."),
  ),
  "karak-chai": ghPage(
    "كرak",
    "كرak — الوصفة والثقافة | تراث الخليج — الإمارات",
    verifiedSeo(
      "الكرak",
      "مهرجان سmithsonian Folklife وVisit Dubai وTable Tales",
      "التاريخ والمكونات والوصفة الموثّقة وتقاليد التقديم.",
    ),
  ),
  "black-tea": ghPage("الشاي الأسود", "الشاي الأسود | تراث الخليج — الإمارات", pageSeo("الشاي الأسود", "الشاي في الإمارات — بانتظار المراجعة")),
  "milk-tea": ghPage("شاي بالحليب", "شاي بالحليب | تراث الخليج — الإمارات", pageSeo("شاي بالحليب", "شاي الحليب — بانتظار المراجعة")),
  "saffron-tea": ghPage("شاي الزعفران", "شاي الزعفران (زعفران كرak) | تراث الخليج", pageSeo("شاي الزعفران", "زعفران كرak — بانتظار المراجعة")),
  "mint-tea": ghPage("شاي النعناع", "شاي النعناع | تراث الخليج — الإمارات", pageSeo("شاي النعناع", "النعناع في الشاي — بانتظار المراجعة")),
  "adani-tea": ghPage("شاي عدني", "شاي عدني | تراث الخليج — الإمارات", pageSeo("شاي عدني", "تراث شاي عدن — بانتظار المراجعة")),
  "raw-coffee-company": ghPage(
    "RAW Coffee Company",
    "RAW Coffee Company | محمصة دبي المتخصصة | تراث الخليج",
    verifiedSeo("RAW Coffee Company", "الموقع الرسمي للمحمصة", "محمصة دبي المتخصصة وحرم SCA للتدريب."),
  ),
  "the-espresso-lab": ghPage(
    "The Espresso Lab",
    "The Espresso Lab | محمصة microlots دبي | تراث الخليج",
    verifiedSeo("The Espresso Lab", "الموقع الرسمي للمحمصة", "قهوة متخصصة من دبي وتوريد microlots."),
  ),
  "seven-fortunes": ghPage(
    "Seven Fortunes",
    "Seven Fortunes Coffee Roasters | دبي | تراث الخليج",
    verifiedSeo("Seven Fortunes", "الموقع الرسمي للمحمصة", "التحميص في دبي وتدريب SCA واستشارات المعدات."),
  ),
  "cypher-roastery": ghPage(
    "Cypher Roastery",
    "Cypher Urban Roastery | دبي | تراث الخليج",
    verifiedSeo("Cypher Roastery", "الموقع الرسمي للمحمصة", "تحميص القهوة المتخصصة في دبي والتوريد بالجملة."),
  ),
  "boom-coffee": ghPage(
    "Boom Coffee",
    "Boom Coffee | تراث الخليج — محظور",
    "Boom Coffee (الإمارات) — الملف محظور حتى الحصول على مصدر أولي موثّق. لا تُنشر تفاصيل غير موثّقة.",
  ),
  "gold-box-roastery": ghPage(
    "Gold Box Roastery",
    "Gold Box Coffee Roasters | دبي | تراث الخليج",
    verifiedSeo("Gold Box Roastery", "الموقع الرسمي للمحمصة", "تحميص القهوة المتخصصة للفنادق والمقاهي في دبي."),
  ),
  "nightjar-coffee": ghPage(
    "Nightjar Coffee",
    "Nightjar Coffee Roasters | السرkal دبي | تراث الخليج",
    verifiedSeo("Nightjar Coffee", "الموقع الرسمي للمحمصة", "التحميص الحرفي والcold brew في Alserkal Avenue."),
  ),
} as const;

export const gulfHeritageRecipeTitlesAr: Record<string, string> = {
  "smithsonian-karak-chai": "كرak (شاي بالحليب والهيل)",
  "table-tales-karak-chai": "كرak (شاي بالحليب والهيل)",
  "dct-al-gahwa-activity-guide": "دليل نشاط القهوة العربية",
  "dct-gahwa-arabic-coffee-publication": "القهوة العربية (Gahwa)",
  "raw-6-simple-brewing": "6 طرق تحضير بسيطة",
  "raw-cold-brew-recipes": "وصفات cold brew",
  "raw-espresso-martini": "RAW Espresso Martini",
  "adani-tea-recipe": "وصفة شاي عدني",
};

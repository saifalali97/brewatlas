import type { GulfHeritageRoasterPageSlug, GulfHeritageRoasterProfileFields } from "@/types/gulf-heritage";

/**
 * Arabic roaster profile fields — Arabic renderings of verified English editorial
 * from official roastery websites. See research/gulf-heritage/uae/roasters/*.json
 */
export const UAE_ROASTER_PROFILE_FIELDS_AR: Partial<
  Record<GulfHeritageRoasterPageSlug, Partial<GulfHeritageRoasterProfileFields>>
> = {
  "raw-coffee-company": {
    history:
      "RAW Coffee Company علامة إماراتية محلية، معترف بها دولياً كرائدة في سوق القهوة المتخصصة. يديرها يومياً المالكان Kim Thompson وMatt Toogood، وكلاهما حاصل على أول شهادة Diploma من جمعية القهوة المتخصصة الدولية (SCA) في منطقة الشرق الأوسط وشمال أفريقيا.",
    story:
      "RAW Coffee Company علامة إماراتية محلية، معترف بها دولياً كرائدة في سوق القهوة المتخصصة. يديرها يومياً المالكان Kim Thompson وMatt Toogood، وكلاهما حاصل على أول شهادة Diploma من جمعية القهوة المتخصصة الدولية (SCA) في منطقة الشرق الأوسط وشمال أفريقيا.",
    founder: "Kim Thompson وMatt Toogood",
    location: "القوز، دبي، الإمارات العربية المتحدة",
    branches: ["القوز، دبي"],
    roastingPhilosophy:
      "جوهر عملنا هو توريد وتحميص وتزويد السوق المحلي B2B وB2C بقهوة فاخرة. نقدّم قهوة متخصصة محمصة طازجة في مستودعنا في القوز. إنه قلب وروح كل ما نفعله في RAW.",
    signatureCoffees: ["أصول فردية موسمية", "خلطات espresso منزلية"],
    coffeeOrigins: ["إثيوبيا", "كولومبيا", "البرازيل"],
    awards:
      "فائز BBC Good Foods 2022 لأفضل محمصة قهوة محلية؛ حاصل على Proudly Dubai من DTCM 2022؛ 4 أبطال قهوة إمارات.",
  },
  "the-espresso-lab": {
    history:
      "أسسها رجل الأعمال الإماراتي Ibrahim Al Mallouhi، The Espresso Lab شركة قهوة حرفية من دبي تجسّد قلب وروح القهوة الحرفية. يعود شغف Al Mallouhi بالقهوة إلى أيام طفولته بجانب جدته التي كانت تحمّص القهوة العربية بدقة متناهية.",
    story:
      "أسسها رجل الأعمال الإماراتي Ibrahim Al Mallouhi، The Espresso Lab شركة قهوة حرفية من دبي تجسّد قلب وروح القهوة الحرفية. يعود شغف Al Mallouhi بالقهوة إلى أيام طفولته بجانب جدته التي كانت تحمّص القهوة العربية بدقة متناهية.",
    founder: "Ibrahim Al Mallouhi",
    location: "Dubai Design District، القوز، أبوظبي، والشارقة، الإمارات العربية المتحدة",
    branches: ["Dubai Design District", "القوز", "أبوظبي", "الشارقة"],
    roastingPhilosophy:
      "يبدأ التوريد بتحديد واختيار microlots عالية الجودة، يليه تحميص دقيق لإبراز أفضل صفات كل صنف. كل مرحلة من الطحن إلى التحضير تُكيَّف حسب تفضيل الزبون النهائي، سواء espresso أو drip أو cold brew.",
    signatureCoffees: ["microlots موسمية", "قهوة محدودة الإصدار"],
    featuredBeans: "العروض الموسمية تقدّم قهوة حصرية محدودة الإصدار من مناطق مميزة حول العالم.",
    coffeeOrigins: ["إثيوبيا", "بنما", "كولومبيا"],
    awards:
      "UAE National Barista Championship 2016، 2017، 2018، 2025؛ UAE National Brewers Cup Championship 2016، 2017، 2021، 2023، 2026؛ UAE National Roasting Championship 2026.",
  },
  "seven-fortunes": {
    history:
      "في Seven Fortunes نحمّص حبوب قهوة فاخرة ونقدّم تدريبات SCA ومعدات مقاهٍ. نقدّم تصميم البار، وتدريب barista، ومعدات المقاهي (بما في ذلك آلات espresso La Marzocco)، وصيانة المعدات، والاستشارات العامة.",
    story:
      "في Seven Fortunes نحمّص حبوب قهوة فاخرة ونقدّم تدريبات SCA ومعدات مقاهٍ. نقدّم تصميم البار، وتدريب barista، ومعدات المقاهي (بما في ذلك آلات espresso La Marzocco)، وصيانة المعدات، والاستشارات العامة.",
    location: "المنطقة الصناعية — القوز، دبي، الإمارات العربية المتحدة",
    branches: ["المنطقة الصناعية — القوز، دبي"],
    roastingPhilosophy:
      "في Seven Fortunes نحمّص حبوب قهوة فاخرة ونقدّم تدريبات SCA ومعدات مقاهٍ.",
    brewingRecommendations: "تدريب barista معتمد من SCA واستشارات معدات espresso.",
  },
  "cypher-roastery": {
    history:
      "من منشأة حديثة في دبي، الإمارات العربية المتحدة، تُورّد Cypher وتُصنَّف وتحمّص قهوة متخصصة فاخرة لتلبية احتياجات وذوق المستهلكين بالجملة الإقليميين وعشاق القهوة المتخصصة.",
    story:
      "من منشأة حديثة في دبي، الإمارات العربية المتحدة، تُورّد Cypher وتُصنَّف وتحمّص قهوة متخصصة فاخرة لتلبية احتياجات وذوق المستهلكين بالجملة الإقليميين وعشاق القهوة المتخصصة.",
    location: "المنطقة الصناعية 3 — القوز، دبي، الإمارات العربية المتحدة",
    branches: ["المنطقة الصناعية 3 — القوز، دبي"],
    roastingPhilosophy:
      "تلتزم الشركة بشدة بتعزيز ممارسات التجارة العادلة عبر دورة حياة حبة البن مع التركيز على الجودة والشفافية والاتساق والمسؤولية الاجتماعية. نأمل أن يقود شغفنا بالقهوة روحنا الابتكارية، ومن خلال ذلك نُعيد إحياء العلاقة بين الجزيرة العربية والقهوة.",
    coffeeOrigins: ["إثيوبيا", "كينيا", "كولومبيا"],
  },
  "gold-box-roastery": {
    history:
      "تحمّص Gold Box Coffee Roasters حبوب القهوة الخضراء بفن لإنتاج قهوة متخصصة عالمية المستوى للعملاء والفنادق والمقاهي في أنحاء الإمارات العربية المتحدة.",
    story:
      "تحمّص Gold Box Coffee Roasters حبوب القهوة الخضراء بفن لإنتاج قهوة متخصصة عالمية المستوى للعملاء والفنادق والمقاهي في أنحاء الإمارات العربية المتحدة.",
    location:
      "Warehouse #7، Building SMARK 3، Umm Suqeim Rd. East، Al Quoz Industrial Third، دبي، الإمارات العربية المتحدة",
    branches: ["Al Quoz Industrial Third، دبي"],
    awards:
      "Luca Croce: بطل UK Brewers Cup 2022–2023، المركز الرابع World Brewers Cup 2022–2023؛ Mon Alpas: بطل UAE Latte Art 2021–2022؛ Kiah Parangue: بطل UAE Barista Lavazza 2022–2023، بطل World Lavazza Barista 2022–2023؛ Lyndon Recera: بطل UAE Barista 2015–2016 و2017–2018.",
  },
  "nightjar-coffee": {
    history:
      "Nightjar رائدة حائزة على جوائز في التحميص الحرفي للقهوة، وإنتاج cold brew، وصناعة تجارب ممتعة. أسسها Leon Surynt، شغوفاً بالقهوة والمجتمعات التي تجمعها، بروح «نهتم ونصنعها جيداً».",
    story:
      "Nightjar رائدة حائزة على جوائز في التحميص الحرفي للقهوة، وإنتاج cold brew، وصناعة تجارب ممتعة. أسسها Leon Surynt، شغوفاً بالقهوة والمجتمعات التي تجمعها، بروح «نهتم ونصنعها جيداً».",
    founder: "Leon Surynt",
    location: "Warehouse 62، Alserkal Avenue، Al Quoz، دبي، الإمارات العربية المتحدة",
    branches: ["Alserkal Avenue، Al Quoz، دبي"],
    roastingPhilosophy:
      "قهوة حرفية | مشروبات حرفية | طعام نحبه | Hi-Fi ممتاز | تجارب ممتعة. وُلدت في دبي… وتصدّر الأجواء.",
    signatureCoffees: ["خلطات موسمية", "Cold Brew", "أصول و microlots"],
    featuredBeans: "خلطات موسمية، Cold Brew، أصول و microlots.",
    brewingRecommendations: "إنتاج cold brew وعروض filter موسمية.",
  },
};

export function getUaeRoasterProfileFieldsAr(
  slug: GulfHeritageRoasterPageSlug,
): Partial<GulfHeritageRoasterProfileFields> | null {
  return UAE_ROASTER_PROFILE_FIELDS_AR[slug] ?? null;
}

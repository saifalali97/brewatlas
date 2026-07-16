import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Folio, FolioItem } from "@/app/components/atlas/folio";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { interpolate, translate } from "@/lib/i18n/format";
import { difficultyLabelKey } from "@/lib/i18n/home-labels";
import { getLocale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/types";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/devices",
    locale,
    title: dictionary.metadata.devicesTitle,
    description: dictionary.metadata.devicesDescription,
  });
}

const deviceNameKeys: (keyof Dictionary["devicesPage"])[] = [
  "deviceNamePourOver",
  "deviceNameEspresso",
  "deviceNameFrenchPress",
  "deviceNameAeropress",
  "deviceNameColdBrew",
  "deviceNameSiphon",
];

export default async function DevicesPage() {
  const locale = await getLocale();
  const [dictionary, content] = await Promise.all([getDictionary(locale), getHomeContent(locale)]);
  const p = dictionary.devicesPage;

  return (
    <SectionFrame id="devices-listing" ariaLabelledBy="devices-listing-heading" padding="compact">
      <PageHeader headingId="devices-listing-heading" eyebrow={p.eyebrow} title={p.title} description={p.description} />

      <div className="mb-16 grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden lg:col-span-5">
          <Image
            src={content.brewMethods[0]?.image ?? "/images/methods/pour-over.svg"}
            alt={p.xbloomCalloutTitle}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover object-center photo-grade-workshop"
            unoptimized={(content.brewMethods[0]?.image ?? "").endsWith(".svg")}
          />
        </div>
        <div className="lg:col-span-7">
          <p className={acTypography.eyebrow}>{p.smartBrewingLabel}</p>
          <h2 className={acTypography.h2}>{p.xbloomCalloutTitle}</h2>
          <p className={acTypography.body}>{p.xbloomCalloutDescription}</p>
          <Link
            href="/devices/xbloom"
            className={`${acTypography.nav} mt-8 inline-flex items-center gap-2 text-ac-copper hover:text-ac-espresso ${acFocus.ring}`}
          >
            {p.exploreXbloom} →
          </Link>
        </div>
      </div>

      <Folio ariaLabel={p.title}>
        {content.brewMethods.map((method, index) => {
          const deviceNameKey = deviceNameKeys[index];
          const deviceName = deviceNameKey ? p[deviceNameKey] : method.name;

          return (
            <FolioItem
              key={method.name}
              href="/recipes"
              index={String(index + 1).padStart(2, "0")}
              title={deviceName}
              imageSrc={method.image}
              imageAlt={interpolate(dictionary.homeBrewingMethods.imageAltTemplate, {
                name: deviceName,
                suitableRoast: method.suitableRoast,
              })}
              imageGrade="workshop"
              description={translate(dictionary, "devicesPage.usedForTemplate", {
                method: method.name.toLowerCase(),
                description: method.description,
              })}
              meta={
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className={acTypography.folioMeta}>
                    {p.brewTimeLabel}: {method.brewTime}
                  </span>
                  <span className={acTypography.folioMeta}>
                    {p.bestRoastLabel}: {method.suitableRoast}
                  </span>
                  <DifficultyIndicator
                    level={method.difficulty}
                    label={translate(dictionary, difficultyLabelKey(method.difficulty))}
                  />
                </div>
              }
            />
          );
        })}
      </Folio>
    </SectionFrame>
  );
}

import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { ghMotion, ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";
import {
  hasGulfHeritageImageAsset,
  resolveGulfHeritageImageAlt,
  resolveGulfHeritageImageUrl,
  type GulfHeritageImageAsset,
  type GulfHeritagePageImages,
} from "@/types/gulf-heritage-images";

type GulfHeritageGallerySectionProps = {
  images: GulfHeritagePageImages;
  labels: {
    hero: string;
    inline: string;
    stepImages: string;
    gallery: string;
    equipment: string;
    historical: string;
  };
  creditLabels: {
    caption: string;
    credit: string;
    license: string;
    photographer: string;
  };
  pageTitle: string;
  /** When set, only render matching slots. */
  slots?: Array<"hero" | "inline" | "stepImages" | "gallery" | "equipment" | "historical">;
};

function ImageMeta({
  image,
  creditLabels,
}: {
  image: GulfHeritageImageAsset;
  creditLabels: GulfHeritageGallerySectionProps["creditLabels"];
}) {
  const meta = [
    image.caption ? `${creditLabels.caption}: ${image.caption}` : null,
    image.photographer ? `${creditLabels.photographer}: ${image.photographer}` : null,
    image.credit ? `${creditLabels.credit}: ${image.credit}` : null,
    image.license ? `${creditLabels.license}: ${image.license}` : null,
  ].filter(Boolean);

  if (meta.length === 0) return null;

  return <p className="mt-2 text-xs leading-relaxed text-ac-espresso/65">{meta.join(" · ")}</p>;
}

function ImageGrid({
  assets,
  altPrefix,
  creditLabels,
}: {
  assets?: readonly GulfHeritageImageAsset[];
  altPrefix: string;
  creditLabels: GulfHeritageGallerySectionProps["creditLabels"];
}) {
  const rendered = (assets ?? []).filter((item) => hasGulfHeritageImageAsset(item));
  if (rendered.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {rendered.map((asset, index) => {
        const url = resolveGulfHeritageImageUrl(asset);
        if (!url) return null;

        return (
          <figure key={`${url}-${index}`} className={`${ghMotion.fadeIn} group relative aspect-[4/3] overflow-hidden rounded-xl`}>
            <OptimizedImage
              src={url}
              alt={resolveGulfHeritageImageAlt(asset, `${altPrefix} ${index + 1}`)}
              fill
              loading="lazy"
              sizes="(min-width: 640px) 200px, 45vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none"
            />
            <figcaption>
              <ImageMeta image={asset} creditLabels={creditLabels} />
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

function GallerySectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 scroll-mt-28">
      <h2 className={ghTypography.sectionTitle}>{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ImageSlot({
  title,
  asset,
  assets,
  alt,
  creditLabels,
  priorityImage = false,
}: {
  title: string;
  asset?: GulfHeritageImageAsset | null;
  assets?: readonly GulfHeritageImageAsset[];
  alt: string;
  creditLabels: GulfHeritageGallerySectionProps["creditLabels"];
  priorityImage?: boolean;
}) {
  const url = resolveGulfHeritageImageUrl(asset ?? null);
  const hasAssets = assets?.some((item) => hasGulfHeritageImageAsset(item));

  if (!url && !hasAssets) {
    return null;
  }

  return (
    <GallerySectionBlock title={title}>
      {url && asset ? (
        <figure
          className={`relative aspect-[16/9] overflow-hidden sm:aspect-[2/1] ${ghSurfaces.cardElevated} ${ghMotion.fadeIn}`}
        >
          <OptimizedImage
            src={url}
            alt={resolveGulfHeritageImageAlt(asset, alt)}
            fill
            priority={priorityImage}
            sizes="(min-width: 1024px) 704px, 100vw"
            loading={priorityImage ? undefined : "lazy"}
            className="object-cover object-center"
          />
          <figcaption className="px-4 py-3">
            <ImageMeta image={asset} creditLabels={creditLabels} />
          </figcaption>
        </figure>
      ) : null}
      {assets ? (
        <div className={url ? "mt-4" : ""}>
          <ImageGrid assets={assets} altPrefix={alt} creditLabels={creditLabels} />
        </div>
      ) : null}
    </GallerySectionBlock>
  );
}

/** Hero, inline, step, gallery, equipment, and historical image slots. */
export function GulfHeritageGallerySection({
  images,
  labels,
  creditLabels,
  pageTitle,
  slots,
}: GulfHeritageGallerySectionProps) {
  const show = (slot: NonNullable<GulfHeritageGallerySectionProps["slots"]>[number]) =>
    !slots || slots.includes(slot);

  return (
    <>
      {show("hero") ? (
        <ImageSlot
          title={labels.hero}
          asset={images.hero}
          alt={pageTitle}
          creditLabels={creditLabels}
          priorityImage
        />
      ) : null}
      {show("inline") ? (
        <ImageSlot
          title={labels.inline}
          assets={images.inline}
          alt={`${pageTitle} inline`}
          creditLabels={creditLabels}
        />
      ) : null}
      {show("stepImages") ? (
        <ImageSlot
          title={labels.stepImages}
          assets={images.stepImages}
          alt={`${pageTitle} step`}
          creditLabels={creditLabels}
        />
      ) : null}
      {show("gallery") ? (
        <ImageSlot
          title={labels.gallery}
          assets={images.gallery}
          alt={`${pageTitle} gallery`}
          creditLabels={creditLabels}
        />
      ) : null}
      {show("equipment") ? (
        <ImageSlot
          title={labels.equipment}
          assets={images.equipment}
          alt={`${pageTitle} equipment`}
          creditLabels={creditLabels}
        />
      ) : null}
      {show("historical") ? (
        <ImageSlot
          title={labels.historical}
          assets={images.historical}
          alt={`${pageTitle} historical`}
          creditLabels={creditLabels}
        />
      ) : null}
    </>
  );
}

/** Hero-only image slot for page headers. */
export function GulfHeritageHeroSection({
  images,
  labels,
  creditLabels,
  pageTitle,
}: Pick<
  GulfHeritageGallerySectionProps,
  "images" | "labels" | "creditLabels" | "pageTitle"
>) {
  return (
    <GulfHeritageGallerySection
      images={images}
      labels={labels}
      creditLabels={creditLabels}
      pageTitle={pageTitle}
      slots={["hero"]}
    />
  );
}

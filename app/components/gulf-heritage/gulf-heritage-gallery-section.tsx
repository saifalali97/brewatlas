import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { GhImagePlaceholder } from "@/app/components/gulf-heritage/gh-image-placeholder";
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
  pendingMessage: string;
  pageTitle: string;
  placeholderTitle: string;
  placeholderDescription: string;
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
          <figure key={`${url}-${index}`} className={`${ghMotion.fadeIn} group overflow-hidden rounded-xl`}>
            <OptimizedImage
              src={url}
              alt={resolveGulfHeritageImageAlt(asset, `${altPrefix} ${index + 1}`)}
              width={400}
              height={300}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none"
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
  pendingMessage,
  creditLabels,
  placeholderTitle,
  placeholderDescription,
}: {
  title: string;
  asset?: GulfHeritageImageAsset | null;
  assets?: readonly GulfHeritageImageAsset[];
  alt: string;
  pendingMessage: string;
  creditLabels: GulfHeritageGallerySectionProps["creditLabels"];
  placeholderTitle: string;
  placeholderDescription: string;
}) {
  const url = resolveGulfHeritageImageUrl(asset ?? null);
  const hasAssets = assets?.some((item) => hasGulfHeritageImageAsset(item));

  if (!url && !hasAssets) {
    return (
      <GallerySectionBlock title={title}>
        <GhImagePlaceholder title={placeholderTitle} description={placeholderDescription || pendingMessage} />
      </GallerySectionBlock>
    );
  }

  return (
    <GallerySectionBlock title={title}>
      {url && asset ? (
        <figure className={`${ghSurfaces.cardElevated} overflow-hidden ${ghMotion.fadeIn}`}>
          <OptimizedImage
            src={url}
            alt={resolveGulfHeritageImageAlt(asset, alt)}
            width={960}
            height={540}
            loading="lazy"
            className="w-full object-cover"
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
  pendingMessage,
  pageTitle,
  slots,
  placeholderTitle,
  placeholderDescription,
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
          pendingMessage={pendingMessage}
          creditLabels={creditLabels}
          placeholderTitle={placeholderTitle}
          placeholderDescription={placeholderDescription}
        />
      ) : null}
      {show("inline") ? (
        <ImageSlot
          title={labels.inline}
          assets={images.inline}
          alt={`${pageTitle} inline`}
          pendingMessage={pendingMessage}
          creditLabels={creditLabels}
          placeholderTitle={placeholderTitle}
          placeholderDescription={placeholderDescription}
        />
      ) : null}
      {show("stepImages") ? (
        <ImageSlot
          title={labels.stepImages}
          assets={images.stepImages}
          alt={`${pageTitle} step`}
          pendingMessage={pendingMessage}
          creditLabels={creditLabels}
          placeholderTitle={placeholderTitle}
          placeholderDescription={placeholderDescription}
        />
      ) : null}
      {show("gallery") ? (
        <ImageSlot
          title={labels.gallery}
          assets={images.gallery}
          alt={`${pageTitle} gallery`}
          pendingMessage={pendingMessage}
          creditLabels={creditLabels}
          placeholderTitle={placeholderTitle}
          placeholderDescription={placeholderDescription}
        />
      ) : null}
      {show("equipment") ? (
        <ImageSlot
          title={labels.equipment}
          assets={images.equipment}
          alt={`${pageTitle} equipment`}
          pendingMessage={pendingMessage}
          creditLabels={creditLabels}
          placeholderTitle={placeholderTitle}
          placeholderDescription={placeholderDescription}
        />
      ) : null}
      {show("historical") ? (
        <ImageSlot
          title={labels.historical}
          assets={images.historical}
          alt={`${pageTitle} historical`}
          pendingMessage={pendingMessage}
          creditLabels={creditLabels}
          placeholderTitle={placeholderTitle}
          placeholderDescription={placeholderDescription}
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
  pendingMessage,
  pageTitle,
  placeholderTitle,
  placeholderDescription,
}: Pick<
  GulfHeritageGallerySectionProps,
  | "images"
  | "labels"
  | "creditLabels"
  | "pendingMessage"
  | "pageTitle"
  | "placeholderTitle"
  | "placeholderDescription"
>) {
  return (
    <GulfHeritageGallerySection
      images={images}
      labels={labels}
      creditLabels={creditLabels}
      pendingMessage={pendingMessage}
      pageTitle={pageTitle}
      slots={["hero"]}
      placeholderTitle={placeholderTitle}
      placeholderDescription={placeholderDescription}
    />
  );
}

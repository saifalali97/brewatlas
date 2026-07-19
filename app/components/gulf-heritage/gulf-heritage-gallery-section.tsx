import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { GulfHeritageContentSection } from "@/app/components/gulf-heritage/gulf-heritage-content-section";
import { GulfHeritagePendingContent } from "@/app/components/gulf-heritage/gulf-heritage-pending-content";
import { surfaces } from "@/lib/constants/styles";
import type { GulfHeritagePageImages } from "@/types/gulf-heritage-images";

type GulfHeritageGallerySectionProps = {
  images: GulfHeritagePageImages;
  labels: {
    hero: string;
    gallery: string;
    equipment: string;
    historical: string;
  };
  pendingMessage: string;
  pageTitle: string;
};

function ImageGrid({ urls, altPrefix }: { urls: readonly string[]; altPrefix: string }) {
  if (urls.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {urls.map((url, index) => (
        <OptimizedImage
          key={`${url}-${index}`}
          src={url}
          alt={`${altPrefix} ${index + 1}`}
          width={400}
          height={300}
          className="aspect-[4/3] w-full rounded-lg object-cover"
        />
      ))}
    </div>
  );
}

function ImageSlot({
  title,
  url,
  urls,
  alt,
  pendingMessage,
}: {
  title: string;
  url?: string | null;
  urls?: readonly string[];
  alt: string;
  pendingMessage: string;
}) {
  const hasUrl = Boolean(url);
  const hasUrls = urls && urls.length > 0;

  if (!hasUrl && !hasUrls) {
    return (
      <GulfHeritageContentSection title={title}>
        <div className={`${surfaces.lightInset} flex min-h-[10rem] items-center justify-center px-6 py-8 text-center`}>
          <GulfHeritagePendingContent message={pendingMessage} />
        </div>
      </GulfHeritageContentSection>
    );
  }

  return (
    <GulfHeritageContentSection title={title}>
      {hasUrl && url ? (
        <OptimizedImage
          src={url}
          alt={alt}
          width={960}
          height={540}
          className="w-full rounded-lg object-cover"
        />
      ) : null}
      {hasUrls ? <ImageGrid urls={urls!} altPrefix={alt} /> : null}
    </GulfHeritageContentSection>
  );
}

/** Hero, gallery, equipment, and historical image slots for Gulf Heritage pages. */
export function GulfHeritageGallerySection({
  images,
  labels,
  pendingMessage,
  pageTitle,
}: GulfHeritageGallerySectionProps) {
  return (
    <>
      <ImageSlot title={labels.hero} url={images.hero} alt={pageTitle} pendingMessage={pendingMessage} />
      <ImageSlot
        title={labels.gallery}
        urls={images.gallery}
        alt={`${pageTitle} gallery`}
        pendingMessage={pendingMessage}
      />
      <ImageSlot
        title={labels.equipment}
        urls={images.equipment}
        alt={`${pageTitle} equipment`}
        pendingMessage={pendingMessage}
      />
      <ImageSlot
        title={labels.historical}
        urls={images.historical}
        alt={`${pageTitle} historical`}
        pendingMessage={pendingMessage}
      />
    </>
  );
}

import { OptimizedImage } from "@/app/components/ui/optimized-image";

type PageEditorialPhotoProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

/** Full-width editorial banner for standalone pages — additive, no layout refactor. */
export function PageEditorialPhoto({
  src,
  alt,
  priority = false,
  className = "",
}: PageEditorialPhotoProps) {
  return (
    <div
      className={`relative mb-14 aspect-[21/9] overflow-hidden rounded-sm md:mb-16 ${className}`.trim()}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ac-espresso/25 via-transparent to-transparent"
      />
    </div>
  );
}

import { OptimizedImage } from "@/app/components/ui/optimized-image";

type PageEditorialPhotoProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  /** Shorter banner for auth pages on mobile */
  variant?: "default" | "compact";
};

/** Full-width editorial banner for standalone pages — additive, no layout refactor. */
export function PageEditorialPhoto({
  src,
  alt,
  priority = false,
  className = "",
  variant = "default",
}: PageEditorialPhotoProps) {
  const frameClass =
    variant === "compact"
      ? "relative mb-6 aspect-[5/2] max-h-[7.5rem] overflow-hidden rounded-sm sm:mb-14 sm:aspect-[21/9] sm:max-h-none md:mb-16"
      : "relative mb-14 aspect-[21/9] overflow-hidden rounded-sm md:mb-16";

  return (
    <div className={`${frameClass} ${className}`.trim()}>
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

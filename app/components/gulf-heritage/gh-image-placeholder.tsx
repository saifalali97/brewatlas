import { ImageIcon } from "lucide-react";
import { ghMotion, ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";

type GhImagePlaceholderProps = {
  title: string;
  description: string;
  compact?: boolean;
};

/** Premium placeholder when verified images are not yet available. */
export function GhImagePlaceholder({ title, description, compact = false }: GhImagePlaceholderProps) {
  return (
    <div
      className={`${ghSurfaces.placeholder} ${ghMotion.fadeIn} flex flex-col items-center justify-center px-6 text-center ${
        compact ? "min-h-[10rem] py-8" : "min-h-[14rem] py-12 sm:min-h-[18rem]"
      }`}
      role="img"
      aria-label={title}
    >
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-ba-espresso/10 bg-ba-pearl/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div
          aria-hidden
          className="absolute inset-2 rounded-xl bg-gradient-to-br from-ba-sand/60 via-transparent to-ba-bronze/10"
        />
        <ImageIcon aria-hidden className="relative h-7 w-7 text-ba-bronze/80" strokeWidth={1.5} />
      </div>
      <p className={`${ghTypography.metaLabel} text-ba-bronze`}>{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ac-espresso/70">{description}</p>
    </div>
  );
}

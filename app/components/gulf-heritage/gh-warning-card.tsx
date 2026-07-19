import { AlertTriangle } from "lucide-react";
import { ghMotion, ghSurfaces } from "@/app/components/gulf-heritage/shared/gh-styles";

type GhWarningCardProps = {
  children: React.ReactNode;
};

/** Warning card for common mistakes and cautions. */
export function GhWarningCard({ children }: GhWarningCardProps) {
  return (
    <div
      className={`${ghSurfaces.articlePanelInset} ${ghMotion.fadeIn} flex gap-3 border-amber-700/15 bg-gradient-to-r from-amber-50/80 to-transparent p-4 sm:p-5`}
    >
      <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-amber-800/75" strokeWidth={1.75} />
      <p className="text-sm leading-relaxed text-ac-espresso/88 sm:text-[0.9375rem]">{children}</p>
    </div>
  );
}

import { Lightbulb } from "lucide-react";
import { ghMotion, ghSurfaces } from "@/app/components/gulf-heritage/shared/gh-styles";

type GhTipCardProps = {
  children: React.ReactNode;
};

/** Highlighted tip card for recipe and editorial guidance. */
export function GhTipCard({ children }: GhTipCardProps) {
  return (
    <div
      className={`${ghSurfaces.articlePanelInset} ${ghMotion.fadeIn} flex gap-3 border-ba-gold/20 bg-gradient-to-r from-ba-gold/[0.08] to-transparent p-4 sm:p-5`}
    >
      <Lightbulb aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ba-bronze" strokeWidth={1.75} />
      <p className="text-sm leading-relaxed text-ac-espresso/88 sm:text-[0.9375rem]">{children}</p>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionDescription } from "@/app/components/recipes/directory/section-description";
import { SectionTitle } from "@/app/components/recipes/directory/section-title";
import { buttons } from "@/lib/constants/styles";
import { rdCard, rdLayout } from "@/lib/design-system/recipes-directory";

type CTASectionProps = {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  className?: string;
};

/** Bottom CTA band for Recipes directory pages. */
export function CTASection({
  title,
  description,
  buttonLabel,
  href,
  className = "",
}: CTASectionProps) {
  return (
    <section className={`${rdLayout.container} pb-4 ${className}`.trim()}>
      <div className={`${rdCard.warmPanel} px-6 py-10 text-center sm:px-10 sm:py-12`}>
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#C4A574]/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-xl">
          <SectionTitle>{title}</SectionTitle>
          <SectionDescription tone="cta">{description}</SectionDescription>
          <div className="mt-7 flex justify-center">
            <Link href={href} className={`${buttons.primary} gap-2`}>
              {buttonLabel}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

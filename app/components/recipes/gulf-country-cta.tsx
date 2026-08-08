import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttons } from "@/lib/constants/styles";

type GulfCountryCtaProps = {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
};

/** Bottom CTA encouraging users to browse country roasters. */
export function GulfCountryCta({ title, description, buttonLabel, href }: GulfCountryCtaProps) {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-4 sm:px-8 lg:px-10">
      <div className="relative overflow-hidden rounded-[24px] border border-[#C4A574]/22 bg-[#F7F1E8] px-6 py-10 text-center sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#C4A574]/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-xl">
          <h2 className="font-display text-[1.75rem] font-bold tracking-[-0.03em] text-[#1A1410] sm:text-[2rem]">
            {title}
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-[1.7] text-[#1A1410]/60">{description}</p>
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

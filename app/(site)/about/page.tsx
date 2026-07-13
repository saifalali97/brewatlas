import type { Metadata } from "next";
import { AnimatedStat } from "@/app/components/ui/animated-stat";
import { PageHeader } from "@/app/components/ui/page-header";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons } from "@/lib/constants/styles";
import { siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "BrewAtlas is the world's largest specialty coffee recipe platform. Learn about our mission to help baristas and home brewers dial in every cup.",
  alternates: {
    canonical: "/about",
  },
};

const stats = [
  { label: "Recipes", value: "12,400+" },
  { label: "Roasters", value: "840+" },
  { label: "Countries", value: "62" },
];

export default function AboutPage() {
  return (
    <SectionFrame id="about-page" ariaLabelledBy="about-page-heading" padding="compact">
      <PageHeader
        eyebrow="Our Story"
        title="About BrewAtlas"
        description={siteConfig.description}
      />

      <div className="mx-auto max-w-3xl text-center">
        <p className="text-base leading-[1.8] text-stone-400">
          BrewAtlas started with a simple idea: every great cup of coffee follows a
          recipe worth documenting. We bring together specialty roasters, competition
          baristas, and home brewers to map the exact grind size, water temperature,
          and ratio behind the world&apos;s best coffee — so anyone can reproduce it,
          cup after cup.
        </p>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 py-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
            >
              <AnimatedStat value={stat.value} label={stat.label} />
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col justify-center gap-3 sm:flex-row">
          <RippleLink href="/recipes" className={`${buttons.primary} w-full sm:w-auto`}>
            Explore Recipes
          </RippleLink>
          <RippleLink href="/contact" className={`${buttons.secondary} w-full sm:w-auto`}>
            Get in Touch
          </RippleLink>
        </div>
      </div>
    </SectionFrame>
  );
}

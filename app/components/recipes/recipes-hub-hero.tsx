import { FlaskConical, Heart, ShieldCheck } from "lucide-react";
import { RecipesDirectoryHeroIllustration } from "@/app/components/recipes/recipes-directory-hero-illustration";

type RecipesHubHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  verifiedRoastersLabel: string;
  testedRecipesLabel: string;
  brewedWithLoveLabel: string;
  imageAlt: string;
};

const featureIcons = {
  verified: ShieldCheck,
  tested: FlaskConical,
  love: Heart,
} as const;

/** Hero — reference layout: copy left, Gulf illustration right, feature icons under subtitle. */
export function RecipesHubHero({
  eyebrow,
  title,
  subtitle,
  verifiedRoastersLabel,
  testedRecipesLabel,
  brewedWithLoveLabel,
  imageAlt,
}: RecipesHubHeroProps) {
  const features = [
    { icon: featureIcons.verified, label: verifiedRoastersLabel },
    { icon: featureIcons.tested, label: testedRecipesLabel },
    { icon: featureIcons.love, label: brewedWithLoveLabel },
  ] as const;

  return (
    <section aria-labelledby="recipes-hub-heading" className="bg-[#FDFCF8]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-6 pb-10 pt-8 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:pb-12 lg:pt-10">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#A67B4A]">
            {eyebrow}
          </p>
          <h1
            id="recipes-hub-heading"
            className="mt-3 font-display text-[2.5rem] leading-[1.04] tracking-[-0.03em] text-[#1A1410] sm:text-[2.875rem] lg:text-[3rem]"
          >
            {title}
          </h1>
          <p className="mt-4 max-w-md text-[0.9375rem] leading-[1.65] text-[#1A1410]/68 sm:text-base">
            {subtitle}
          </p>

          <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2 text-[0.8125rem] text-[#1A1410]/75">
                <Icon className="h-4 w-4 shrink-0 text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <div className="relative w-full max-w-[460px]" role="img" aria-label={imageAlt}>
            <RecipesDirectoryHeroIllustration className="h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

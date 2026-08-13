import Image from "next/image";
import { FlaskConical, Heart, ShieldCheck } from "lucide-react";

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

/** Hero — stacked on mobile/tablet; desktop keeps the fixed two-column layout. */
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
    <section
      aria-labelledby="recipes-hub-heading"
      className="mx-auto w-full max-w-[1400px] px-6 py-8 sm:px-8"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[540px_1fr] lg:gap-[40px]">
        <div className="min-w-0 w-full lg:w-[540px] lg:shrink-0 lg:ms-14">
          <p className="mb-[22px] text-[14px] font-semibold uppercase tracking-[0.22em] text-[#A67B4A]">
            {eyebrow}
          </p>
          <h1
            id="recipes-hub-heading"
            className="text-[clamp(2.5rem,10vw,4.75rem)] font-bold leading-[0.95] tracking-[-0.04em] text-black lg:text-[76px]"
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 700,
            }}
          >
            {title}
          </h1>
          <p
            className="mt-4 w-full text-[1.0625rem] leading-[1.7] text-[#1A1410]/68 sm:text-[18px] lg:w-[420px]"
          >
            {subtitle}
          </p>

          <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 lg:mt-[34px] lg:gap-8">
            {features.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 whitespace-nowrap text-[0.8125rem] text-[#1A1410]/75"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto min-w-0 w-full max-w-[760px] lg:mx-0 lg:ltr:-translate-x-10 lg:ltr:-translate-y-2.5 lg:rtl:translate-x-10 lg:rtl:-translate-y-2.5">
          <Image
            src="/images/hero/gulf-recipes-hero-transparent.png"
            alt={imageAlt}
            width={760}
            height={400}
            priority
            sizes="(min-width: 1024px) 760px, 100vw"
            className="h-auto w-full max-w-full object-contain lg:w-[760px] lg:max-w-[760px]"
          />
        </div>
      </div>
    </section>
  );
}

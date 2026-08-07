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

/** Hero — fixed two-column layout: copy left, artwork right. */
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
      className="mx-auto max-w-[1400px] px-8 py-8"
    >
      <div
        className="grid items-center gap-[40px]"
        style={{ gridTemplateColumns: "540px 1fr" }}
      >
        <div
          className="w-[540px] shrink-0"
          style={{ marginLeft: 56 }}
        >
          <p className="mb-[22px] text-[14px] font-semibold uppercase tracking-[0.22em] text-[#A67B4A]">
            {eyebrow}
          </p>
          <h1
            id="recipes-hub-heading"
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 700,
              fontSize: 76,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "#000",
            }}
          >
            {title}
          </h1>
          <p
            className="mt-4 text-[#1A1410]/68"
            style={{ width: 420, fontSize: 18, lineHeight: 1.7 }}
          >
            {subtitle}
          </p>

          <ul
            className="flex items-center"
            style={{ marginTop: 34, gap: 32 }}
          >
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

        <div
          className="relative min-w-0"
          style={{ transform: "translate(-40px, -10px)" }}
        >
          <Image
            src="/images/hero/gulf-recipes-hero-transparent.png"
            alt={imageAlt}
            width={760}
            height={400}
            priority
            className="h-auto w-[760px] max-w-[760px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}

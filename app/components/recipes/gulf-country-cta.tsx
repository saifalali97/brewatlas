import { CTASection } from "@/app/components/recipes/directory";

type GulfCountryCtaProps = {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
};

/** Bottom CTA encouraging users to browse country roasters. */
export function GulfCountryCta({ title, description, buttonLabel, href }: GulfCountryCtaProps) {
  return (
    <CTASection
      title={title}
      description={description}
      buttonLabel={buttonLabel}
      href={href}
    />
  );
}

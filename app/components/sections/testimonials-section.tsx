import { PremiumImage } from "@/app/components/ui/premium-image";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import { TiltCard } from "@/app/components/ui/tilt-card";
import { cards } from "@/lib/constants/styles";
import { interpolate } from "@/lib/i18n/format";
import type { Testimonial } from "@/types/homepage";

type TestimonialsSectionProps = {
  testimonials: Testimonial[];
  eyebrow: string;
  title: string;
  imageAltTemplate: string;
};

function TestimonialCard({ item, imageAltTemplate }: { item: Testimonial; imageAltTemplate: string }) {
  return (
    <TiltCard>
      <blockquote className={`group flex flex-col overflow-hidden ${cards.testimonial} p-0`}>
        <PremiumImage
          src={item.image}
          alt={interpolate(imageAltTemplate, { name: item.name, role: item.role, location: item.location })}
          overlay="portrait"
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="h-52 w-full"
        />
        <div className="flex flex-1 flex-col p-9 md:p-11">
          <p className="flex-1 text-base leading-[1.8] text-stone-300">
            &ldquo;{item.quote}&rdquo;
          </p>
          <footer className="mt-10 border-t border-white/[0.04] pt-8">
            <p className="font-medium text-stone-50">{item.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">{item.role}</p>
            <p className="mt-1 text-xs text-amber-600/70">{item.location}</p>
          </footer>
        </div>
      </blockquote>
    </TiltCard>
  );
}

export function TestimonialsSection({ testimonials, eyebrow, title, imageAltTemplate }: TestimonialsSectionProps) {
  return (
    <SectionFrame id="testimonials" padding="compact" showDividers={false} ariaLabelledBy="testimonials-heading">
      <SectionIntro
        headingId="testimonials-heading"
        eyebrow={eyebrow}
        title={title}
        centered
        titleVariant="legacy"
      />
      <div className="grid gap-8 lg:grid-cols-3">
        {testimonials.map((item) => (
          <TestimonialCard key={item.name} item={item} imageAltTemplate={imageAltTemplate} />
        ))}
      </div>
    </SectionFrame>
  );
}

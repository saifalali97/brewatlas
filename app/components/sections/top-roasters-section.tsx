"use client";

import Image from "next/image";
import { memo } from "react";
import { BookOpen, Calendar, MapPin, Sparkles, Star } from "lucide-react";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import { cards } from "@/lib/constants/styles";
import type { TopRoaster } from "@/types/homepage";

type TopRoastersSectionProps = {
  roasters: TopRoaster[];
};

function RoasterCard({ roaster }: { roaster: TopRoaster }) {
  return (
    <article className={cards.premiumShell}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative h-40 shrink-0 overflow-hidden sm:h-44 lg:h-48">
        <Image
          src={roaster.image}
          alt={`${roaster.name} roastery`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          unoptimized={roaster.image.endsWith(".svg")}
          className="object-cover brightness-[0.92] contrast-[1.04] saturate-[0.94] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <div className={cards.imageOverlay} />
        <div className={cards.imageAmberWash} />
        <div className={cards.imageRadial} />

        {roaster.premium && (
          <div className="absolute right-4 top-4 rounded-full border border-amber-700/35 bg-amber-950/65 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-200/90 backdrop-blur-xl">
            Premium
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full border border-amber-600/30 bg-[#0a0705]/60 px-2.5 py-0.5 backdrop-blur-xl">
          <Star className="h-3 w-3 fill-amber-500/80 text-amber-500/80" aria-hidden />
          <span className="text-[10px] font-medium text-amber-200/90">{roaster.rating}</span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5 lg:p-6">
        <h3 className="text-[1.2rem] font-semibold leading-[1.15] tracking-tight text-stone-50 transition-colors duration-300 group-hover:text-amber-50 lg:text-[1.25rem]">
          {roaster.name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-stone-500">
          <Sparkles className="h-3 w-3 text-amber-500/75" aria-hidden />
          <span className="text-amber-600/80">{roaster.specialty}</span>
        </div>

        <p className="mt-3 line-clamp-2 text-[0.8125rem] leading-[1.65] text-stone-300/90">
          {roaster.description}
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <MetaTile icon={MapPin} label="Country" value={roaster.country} compact />
          <MetaTile icon={Calendar} label="Founded" value={roaster.founded} compact />
          <MetaTile icon={BookOpen} label="Recipes" value={roaster.recipes} compact />
          <MetaTile icon={Star} label="Rating" value={roaster.rating} compact />
        </div>

        <div className="mt-auto border-t border-white/[0.06] pt-4">
          <GhostCtaLink href="#roasters">View Roaster</GhostCtaLink>
        </div>
      </div>
    </article>
  );
}

const MemoizedRoasterCard = memo(RoasterCard);

export function TopRoastersSection({ roasters }: TopRoastersSectionProps) {
  return (
    <SectionFrame id="roasters" className="border-t border-white/[0.04] bg-white/[0.008]">
      <SectionIntro
        eyebrow="Roaster Partners"
        title="Top Roasters"
        description="Discover recipes tailored to beans from the world's most respected specialty roasters."
      />

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {roasters.map((roaster) => (
          <MemoizedRoasterCard key={roaster.name} roaster={roaster} />
        ))}
      </div>
    </SectionFrame>
  );
}

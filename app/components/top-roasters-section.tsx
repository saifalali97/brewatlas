"use client";

import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import { RevealOnScroll } from "./reveal-on-scroll";
import { RippleLink } from "./ripple-link";

export type TopRoaster = {
  name: string;
  country: string;
  founded: string;
  specialty: string;
  rating: string;
  recipes: string;
  description: string;
  image: string;
  premium?: boolean;
};

type TopRoastersSectionProps = {
  roasters: TopRoaster[];
};

function RoasterMeta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/80" aria-hidden />
      <div className="min-w-0">
        <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-stone-500">
          {label}
        </p>
        <p className="mt-0.5 text-[0.8125rem] font-medium leading-snug text-stone-200">
          {value}
        </p>
      </div>
    </div>
  );
}

function RoasterCard({ roaster }: { roaster: TopRoaster }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.11] bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-white/[0.01] shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-amber-500/32 hover:shadow-[0_24px_56px_-18px_rgba(180,120,60,0.24),0_0_0_1px_rgba(217,119,6,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-gradient-to-b from-white/[0.07] via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-600/8 opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative h-40 shrink-0 overflow-hidden sm:h-44 lg:h-48">
        <Image
          src={roaster.image}
          alt={`${roaster.name} roastery`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          unoptimized={roaster.image.endsWith(".svg")}
          className="object-cover brightness-[0.92] contrast-[1.04] saturate-[0.94] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0705]/95 via-[#0a0705]/35 to-[#0a0705]/12" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/14 via-transparent to-[#0a0705]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(217,119,6,0.08),transparent_55%)]" />

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
          <RoasterMeta icon={MapPin} label="Country" value={roaster.country} />
          <RoasterMeta icon={Calendar} label="Founded" value={roaster.founded} />
          <RoasterMeta icon={BookOpen} label="Recipes" value={roaster.recipes} />
          <RoasterMeta icon={Star} label="Rating" value={roaster.rating} />
        </div>

        <div className="mt-auto border-t border-white/[0.06] pt-4">
          <RippleLink
            href="#roasters"
            className="group/btn inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-5 text-sm font-medium text-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-amber-500/45 hover:bg-white/[0.1] hover:shadow-[0_0_36px_rgba(217,119,6,0.22),0_10px_28px_-10px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.14)] active:scale-[0.98] motion-reduce:hover:translate-y-0"
          >
            View Roaster
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 motion-reduce:transform-none"
              aria-hidden
            />
          </RippleLink>
        </div>
      </div>
    </article>
  );
}

export function TopRoastersSection({ roasters }: TopRoastersSectionProps) {
  return (
    <section
      id="roasters"
      className="relative border-t border-white/[0.04] bg-white/[0.008] px-5 py-40 sm:px-6 md:px-7 md:py-44 lg:px-8 lg:py-48"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a0705] via-[#0a0705]/80 to-transparent"
      />

      <RevealOnScroll>
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl md:mb-16 lg:mb-20">
            <p className="text-[0.8125rem] font-medium uppercase tracking-[0.24em] text-amber-500/90">
              Roaster Partners
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-stone-50 sm:text-4xl lg:text-[3.25rem]">
              Top Roasters
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-[1.78] text-stone-400 md:text-xl md:leading-[1.72]">
              Discover recipes tailored to beans from the world&apos;s most
              respected specialty roasters.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
            {roasters.map((roaster) => (
              <RoasterCard key={roaster.name} roaster={roaster} />
            ))}
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}

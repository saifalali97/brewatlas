import { Globe, MapPin, Star } from "lucide-react";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { cards } from "@/lib/constants/styles";
import type { UaeRoaster } from "@/types/uae-brand";

type UaeRoasterCardProps = {
  roaster: UaeRoaster;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Card for a UAE-featured roaster. Never renders a real logo image --
 * per the "no copyrighted logos" requirement, the brand mark is always a
 * generic initials badge in the UAE palette, even if `roaster.logoUrl`
 * is set to a placeholder path.
 */
export function UaeRoasterCard({ roaster }: UaeRoasterCardProps) {
  return (
    <article className={cards.premiumShell}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative flex items-center gap-4 border-b border-white/[0.06] p-5 lg:p-6">
        <span
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-uae-warm-gold/35 bg-gradient-to-br from-uae-warm-gold/25 via-uae-sand/15 to-transparent text-base font-semibold tracking-wide text-uae-pearl"
        >
          {initials(roaster.name)}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[1.1rem] font-semibold leading-[1.15] tracking-tight text-stone-50 transition-colors duration-300 group-hover:text-amber-50">
            {roaster.name}
          </h3>
          {roaster.featured && (
            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-uae-warm-gold/35 bg-uae-warm-gold/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-uae-sand">
              <Star className="h-2.5 w-2.5 fill-uae-warm-gold text-uae-warm-gold" aria-hidden />
              Featured
            </div>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5 lg:p-6">
        {roaster.description && (
          <p className="line-clamp-3 text-[0.8125rem] leading-[1.65] text-stone-300/90">{roaster.description}</p>
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <MetaTile
            icon={MapPin}
            label="Location"
            value={[roaster.city, roaster.emirate].filter(Boolean).join(", ") || "United Arab Emirates"}
            compact
          />
          {roaster.website && <MetaTile icon={Globe} label="Website" value="Visit site" compact />}
        </div>

        {roaster.website && (
          <div className="mt-auto border-t border-white/[0.06] pt-4">
            <GhostCtaLink href={roaster.website}>Visit Roaster</GhostCtaLink>
          </div>
        )}
      </div>
    </article>
  );
}

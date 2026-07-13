import { Coffee, MapPin, Store, Users } from "lucide-react";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { cards } from "@/lib/constants/styles";
import type { UaeCoffeeMapLocation } from "@/types/uae-brand";

const LOCATION_TYPE_LABEL: Record<UaeCoffeeMapLocation["locationType"], string> = {
  roaster: "Roaster",
  cafe: "Cafe",
  majlis: "Majlis",
  roastery_cafe: "Roastery & Cafe",
};

const LOCATION_TYPE_ICON: Record<UaeCoffeeMapLocation["locationType"], typeof Coffee> = {
  roaster: Coffee,
  cafe: Store,
  majlis: Users,
  roastery_cafe: Coffee,
};

type UaeCoffeeMapLocationCardProps = {
  location: UaeCoffeeMapLocation;
};

/** List-style card for a single UAE coffee-map location. No embedded map yet -- this is the read surface for the backend/database foundation described in requirement 5. */
export function UaeCoffeeMapLocationCard({ location }: UaeCoffeeMapLocationCardProps) {
  const Icon = LOCATION_TYPE_ICON[location.locationType];

  return (
    <article className={cards.premiumShell}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative flex flex-1 flex-col p-5 lg:p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-uae-warm-gold/30 bg-uae-warm-gold/10">
            <Icon className="h-3.5 w-3.5 text-uae-warm-gold" aria-hidden />
          </span>
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-uae-sand">
            {LOCATION_TYPE_LABEL[location.locationType]}
          </p>
        </div>

        <h3 className="mt-3 text-[1.05rem] font-semibold leading-[1.2] tracking-tight text-stone-50">
          {location.name}
        </h3>

        {location.description && (
          <p className="mt-2.5 line-clamp-2 text-[0.8125rem] leading-[1.65] text-stone-300/90">
            {location.description}
          </p>
        )}

        <div className="mt-4 grid gap-2">
          <MetaTile
            icon={MapPin}
            label="Location"
            value={[location.city, location.emirate].filter(Boolean).join(", ")}
            compact
          />
        </div>

        <p className="mt-3 text-[0.6875rem] text-stone-500">
          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </p>
      </div>
    </article>
  );
}

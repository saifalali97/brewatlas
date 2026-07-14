import type { LucideIcon } from "lucide-react";
import { Clock, Droplet, Droplets, ListOrdered, Scale, Settings2, Thermometer } from "lucide-react";
import type { ReactNode } from "react";
import { forms, meta } from "@/lib/constants/styles";

/** One preview card's calculated value plus its Phase 18 explainability caption (already fully translated by the caller). */
export type ConverterFieldPreview = {
  display: string;
  /** e.g. "Changed from 94°C — preserving body". Omitted when this field didn't meaningfully change. */
  changeCaption?: string;
};

/** Calculated display values from the conversion engine, keyed per preview card. Omitted fields fall back to `comingSoonValue`. */
export type ConverterPreviewValues = {
  dose?: ConverterFieldPreview;
  water?: ConverterFieldPreview;
  grindSize?: ConverterFieldPreview;
  temperature?: ConverterFieldPreview;
  bloom?: ConverterFieldPreview;
  pours?: ConverterFieldPreview;
  brewTime?: ConverterFieldPreview;
};

type ConverterPreviewProps = {
  label: string;
  /** Shown for any field not yet present in `values` (e.g. before a target device is chosen). */
  comingSoonValue: string;
  doseLabel: string;
  waterLabel: string;
  grindSizeLabel: string;
  temperatureLabel: string;
  bloomLabel: string;
  poursLabel: string;
  brewTimeLabel: string;
  values?: ConverterPreviewValues;
  /** Rendered next to `label`, e.g. the Phase 18 confidence indicator -- kept generic so this component doesn't need to know about confidence. */
  headerExtra?: ReactNode;
};

type PreviewTileProps = {
  icon: LucideIcon;
  label: string;
  field?: ConverterFieldPreview;
  comingSoonValue: string;
};

/** Same tile shape as `MetaTile` (see `app/components/ui/meta-tile.tsx`), plus an optional "what changed and why" caption -- kept as its own component so that shared, site-wide tile doesn't have to carry converter-only concerns. */
function PreviewTile({ icon: Icon, label, field, comingSoonValue }: PreviewTileProps) {
  return (
    <div className={meta.tile}>
      <Icon className={meta.icon} aria-hidden />
      <div className="min-w-0">
        <p className={meta.label}>{label}</p>
        <p className={meta.value}>{field?.display ?? comingSoonValue}</p>
        {field?.changeCaption && <p className="mt-1 text-[10.5px] leading-snug text-amber-400/80">{field.changeCaption}</p>}
      </div>
    </div>
  );
}

/** Output preview grid for the Universal Recipe Converter -- renders real engine output once a target device is selected, otherwise the "coming soon" placeholder (Phase 17.2), with Phase 18's per-field "changed" captions layered on top. */
export function ConverterPreview({
  label,
  comingSoonValue,
  doseLabel,
  waterLabel,
  grindSizeLabel,
  temperatureLabel,
  bloomLabel,
  poursLabel,
  brewTimeLabel,
  values,
  headerExtra,
}: ConverterPreviewProps) {
  const fields = [
    { icon: Scale, label: doseLabel, field: values?.dose },
    { icon: Droplets, label: waterLabel, field: values?.water },
    { icon: Settings2, label: grindSizeLabel, field: values?.grindSize },
    { icon: Thermometer, label: temperatureLabel, field: values?.temperature },
    { icon: Droplet, label: bloomLabel, field: values?.bloom },
    { icon: ListOrdered, label: poursLabel, field: values?.pours },
    { icon: Clock, label: brewTimeLabel, field: values?.brewTime },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={forms.label}>{label}</p>
        {headerExtra}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((item) => (
          <PreviewTile key={item.label} icon={item.icon} label={item.label} field={item.field} comingSoonValue={comingSoonValue} />
        ))}
      </div>
    </div>
  );
}

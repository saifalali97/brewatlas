import { Clock, Droplet, Droplets, ListOrdered, Scale, Settings2, Thermometer } from "lucide-react";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { forms } from "@/lib/constants/styles";

/** Calculated display values from the conversion engine (Phase 17.2), keyed per preview card. Omitted fields fall back to `comingSoonValue`. */
export type ConverterPreviewValues = {
  dose?: string;
  water?: string;
  grindSize?: string;
  temperature?: string;
  bloom?: string;
  pours?: string;
  brewTime?: string;
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
};

/** Output preview grid for the Universal Recipe Converter -- renders real engine output once a target device is selected, otherwise the "coming soon" placeholder (Phase 17.2). */
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
}: ConverterPreviewProps) {
  const fields = [
    { icon: Scale, label: doseLabel, value: values?.dose },
    { icon: Droplets, label: waterLabel, value: values?.water },
    { icon: Settings2, label: grindSizeLabel, value: values?.grindSize },
    { icon: Thermometer, label: temperatureLabel, value: values?.temperature },
    { icon: Droplet, label: bloomLabel, value: values?.bloom },
    { icon: ListOrdered, label: poursLabel, value: values?.pours },
    { icon: Clock, label: brewTimeLabel, value: values?.brewTime },
  ];

  return (
    <div>
      <p className={forms.label}>{label}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <MetaTile key={field.label} icon={field.icon} label={field.label} value={field.value ?? comingSoonValue} />
        ))}
      </div>
    </div>
  );
}

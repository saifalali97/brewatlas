import { Clock, Droplet, Droplets, ListOrdered, Scale, Settings2, Thermometer } from "lucide-react";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { forms } from "@/lib/constants/styles";

type ConverterPreviewProps = {
  label: string;
  /** Shown as every field's value until conversion math ships (Phase 17.2+). */
  comingSoonValue: string;
  doseLabel: string;
  waterLabel: string;
  grindSizeLabel: string;
  temperatureLabel: string;
  bloomLabel: string;
  poursLabel: string;
  brewTimeLabel: string;
};

/** Output preview grid for the Universal Recipe Converter -- placeholder cards only, no calculations yet (Phase 17.1). */
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
}: ConverterPreviewProps) {
  const fields = [
    { icon: Scale, label: doseLabel },
    { icon: Droplets, label: waterLabel },
    { icon: Settings2, label: grindSizeLabel },
    { icon: Thermometer, label: temperatureLabel },
    { icon: Droplet, label: bloomLabel },
    { icon: ListOrdered, label: poursLabel },
    { icon: Clock, label: brewTimeLabel },
  ];

  return (
    <div>
      <p className={forms.label}>{label}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <MetaTile key={field.label} icon={field.icon} label={field.label} value={comingSoonValue} />
        ))}
      </div>
    </div>
  );
}

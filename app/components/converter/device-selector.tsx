"use client";

import { forms } from "@/lib/constants/styles";

/**
 * Devices the Universal Recipe Converter can target (Phase 17.1, UI only).
 * Model names are brand/product terms and are intentionally left
 * untranslated in every locale, matching how xBloom model names are
 * already handled on `/devices/xbloom`.
 */
export const CONVERTER_DEVICES = [
  "V60",
  "Origami",
  "Kalita Wave",
  "Chemex",
  "AeroPress",
  "Clever Dripper",
  "French Press",
  "Orea",
  "April Brewer",
  "xBloom Studio",
  "xBloom Omni",
  "xBloom Original",
  "Espresso",
  "Cold Brew",
] as const;

export type ConverterDevice = (typeof CONVERTER_DEVICES)[number];

type DeviceSelectorProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (device: string) => void;
  /** Hides this device from the option list (e.g. the recipe's current device), so the converter can't target itself. */
  excludeDevice?: string;
};

export function DeviceSelector({ id, label, placeholder, value, onChange, excludeDevice }: DeviceSelectorProps) {
  const options = excludeDevice
    ? CONVERTER_DEVICES.filter((device) => device !== excludeDevice)
    : CONVERTER_DEVICES;

  return (
    <div>
      <label htmlFor={id} className={forms.label}>
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={forms.select}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((device) => (
          <option key={device} value={device}>
            {device}
          </option>
        ))}
      </select>
    </div>
  );
}

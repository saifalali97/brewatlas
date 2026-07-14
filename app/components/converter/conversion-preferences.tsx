"use client";

import { forms } from "@/lib/constants/styles";

export type ConversionPreferencesState = {
  preserveBody: boolean;
  preserveSweetness: boolean;
  preserveAcidity: boolean;
};

/** Sweetness is preserved by default (per Phase 17.1 spec); body/acidity start opt-in. */
export const DEFAULT_CONVERSION_PREFERENCES: ConversionPreferencesState = {
  preserveBody: false,
  preserveSweetness: true,
  preserveAcidity: false,
};

type ConversionPreferencesProps = {
  label: string;
  preferences: ConversionPreferencesState;
  onChange: (preferences: ConversionPreferencesState) => void;
  bodyLabel: string;
  sweetnessLabel: string;
  acidityLabel: string;
};

export function ConversionPreferences({
  label,
  preferences,
  onChange,
  bodyLabel,
  sweetnessLabel,
  acidityLabel,
}: ConversionPreferencesProps) {
  const toggle = (key: keyof ConversionPreferencesState) => {
    onChange({ ...preferences, [key]: !preferences[key] });
  };

  const options: Array<{ key: keyof ConversionPreferencesState; label: string }> = [
    { key: "preserveBody", label: bodyLabel },
    { key: "preserveSweetness", label: sweetnessLabel },
    { key: "preserveAcidity", label: acidityLabel },
  ];

  return (
    <div>
      <p className={forms.label}>{label}</p>
      <div className="mt-3 flex flex-col gap-3">
        {options.map((option) => (
          <label key={option.key} className={forms.checkboxRow}>
            <input
              type="checkbox"
              checked={preferences[option.key]}
              onChange={() => toggle(option.key)}
              className={forms.checkbox}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

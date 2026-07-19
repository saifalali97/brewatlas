"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { acFocus } from "@/lib/design-system/atlas-canon";
import { forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";

type PasswordInputProps = {
  id?: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  labelAside?: ReactNode;
};

export function PasswordInput({
  id,
  name,
  label,
  placeholder,
  required = false,
  minLength,
  autoComplete,
  labelAside,
}: PasswordInputProps) {
  const { t } = useTranslations();
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className={`flex items-center gap-3 ${labelAside ? "justify-between" : ""}`}>
        <label htmlFor={inputId} className={forms.label}>
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`${forms.input} pe-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
          aria-controls={inputId}
          aria-pressed={visible}
          className={`absolute end-2 top-1/2 flex h-9 min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-md text-ac-espresso transition-colors hover:text-ba-espresso ${acFocus.ring} touch-manipulation [-webkit-tap-highlight-color:transparent]`}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    </div>
  );
}

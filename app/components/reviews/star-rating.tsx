"use client";

import { Star } from "lucide-react";
import { useId, useState } from "react";
import { useTranslations } from "@/lib/i18n/translation-context";

type StarRatingInputProps = {
  name: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function StarRatingInput({ name, value, onChange, disabled = false }: StarRatingInputProps) {
  const { t } = useTranslations();
  const groupId = useId();
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  const setRating = (next: number) => {
    if (disabled) return;
    onChange(next);
  };

  const handleKeyDown = (event: React.KeyboardEvent, star: number) => {
    if (disabled) return;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setRating(Math.min(5, (value || star) + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setRating(Math.max(1, (value || star) - 1));
    } else if (event.key >= "1" && event.key <= "5") {
      event.preventDefault();
      setRating(Number(event.key));
    }
  };

  return (
    <div>
      <input type="hidden" name={name} value={value || ""} />
      <div
        id={groupId}
        role="radiogroup"
        aria-label={t("recipeReviews.ratingAriaLabel")}
        className="flex items-center gap-1"
        onMouseLeave={() => setHoverValue(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayValue;
          const selected = star === value;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={t("recipeReviews.starLabel", { star })}
              tabIndex={value === 0 ? (star === 1 ? 0 : -1) : selected ? 0 : -1}
              disabled={disabled}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverValue(star)}
              onKeyDown={(event) => handleKeyDown(event, star)}
              className="rounded-md p-1 transition-colors duration-200 hover:text-ba-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:opacity-50"
            >
              <Star
                className={`h-6 w-6 ${filled ? "fill-amber-400 text-amber-400" : "text-ac-espresso"}`}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

type StarRatingDisplayProps = {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
};

export function StarRatingDisplay({ rating, max = 5, size = "md", label }: StarRatingDisplayProps) {
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-1" aria-label={label} role="img">
      {Array.from({ length: max }).map((_, index) => {
        const star = index + 1;
        const filled = star <= Math.floor(rounded);
        const half = !filled && star - 0.5 <= rounded;
        return (
          <Star
            key={star}
            className={`${iconClass} ${filled || half ? "fill-amber-400 text-amber-400" : "text-ac-espresso"}`}
            aria-hidden
          />
        );
      })}
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}

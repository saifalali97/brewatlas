import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { dsFocus, forms } from "@/lib/constants/styles";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Token-driven text input. Pair with `<Label>`. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", hasError = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={joinClasses(
        forms.input.replace("mt-2 ", ""),
        hasError && "border-red-500/50 focus:border-red-500/60 focus-visible:ring-red-500/30",
        className,
      )}
      {...props}
    />
  );
});

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = "", ...props }: LabelProps) {
  return <label className={joinClasses(forms.label, className)} {...props} />;
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = "", ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={joinClasses(forms.select.replace("mt-2 ", ""), dsFocus.ring, className)}
      {...props}
    />
  );
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = "", ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={joinClasses(
        forms.input.replace("mt-2 ", ""),
        "min-h-[7rem] resize-y",
        className,
      )}
      {...props}
    />
  );
});

export function FieldGroup({
  label,
  htmlFor,
  error,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className={`mt-1.5 text-xs text-red-400/90`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type FormMessageProps = {
  error?: string;
  success?: string;
};

/** Inline status text beneath auth forms — light Atlas surfaces. */
export function FormMessage({ error, success }: FormMessageProps) {
  if (!error && !success) return null;

  return (
    <p
      role="status"
      className={`text-sm leading-relaxed ${error ? "text-red-700" : "text-emerald-800"}`}
    >
      {error ?? success}
    </p>
  );
}

type FormMessageProps = {
  error?: string;
  success?: string;
};

/** Inline status text shown beneath auth forms, styled to match the existing card aesthetic. */
export function FormMessage({ error, success }: FormMessageProps) {
  if (!error && !success) return null;

  return (
    <p
      role="status"
      className={`text-sm leading-relaxed ${error ? "text-red-400/90" : "text-emerald-400/90"}`}
    >
      {error ?? success}
    </p>
  );
}

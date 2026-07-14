import { AlertTriangle } from "lucide-react";

type ConversionWarningsProps = {
  heading: string;
  /** Already-translated warning messages (see `RecipeConverterModal`'s `WARNING_KEYS` map). */
  messages: string[];
};

/**
 * Realistic-limits warning banner (Phase 18 requirement #6) -- only
 * rendered when the engine actually raised a warning, using the same
 * icon + heading + bullet-list pattern already established by the AI
 * Coach's "needs attention" section (see `app/components/coach/ai-coach-demo.tsx`)
 * rather than introducing a new callout style.
 */
export function ConversionWarnings({ heading, messages }: ConversionWarningsProps) {
  if (messages.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-700/25 bg-amber-950/20 px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-amber-400/90">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
        {heading}
      </p>
      <ul className="mt-2 space-y-1.5">
        {messages.map((message) => (
          <li key={message} className="text-sm leading-relaxed text-stone-300">
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Lightweight route transition — top progress bar instead of full-screen takeover. */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[calc(4.5rem+env(safe-area-inset-top,0px))] z-[90] lg:top-0"
    >
      <div className="relative h-0.5 overflow-hidden bg-ba-espresso/[0.04]">
        <div className="animate-loader-bar absolute inset-y-0 start-0 w-1/3 rounded-full bg-gradient-to-r from-ba-bronze/20 via-ba-gold/80 to-ba-bronze/20" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

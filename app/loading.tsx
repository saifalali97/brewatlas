export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ba-ivory"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-1 w-36 overflow-hidden rounded-full bg-ba-espresso/[0.06]">
          <div className="animate-loader-bar absolute inset-y-0 start-0 w-1/3 rounded-full bg-gradient-to-r from-ba-bronze/20 via-ba-gold/80 to-ba-bronze/20" />
        </div>
        <p className="font-display text-sm tracking-[0.12em] text-ac-espresso">BrewAtlas</p>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}

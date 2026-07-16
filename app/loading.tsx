export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-uae-dark-coffee-deep"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-1 w-36 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="animate-loader-bar absolute inset-y-0 start-0 w-1/3 rounded-full bg-gradient-to-r from-uae-warm-gold-deep/20 via-uae-warm-gold/80 to-uae-warm-gold-deep/20" />
        </div>
        <p className="font-display text-sm tracking-[0.12em] text-stone-500">BrewAtlas</p>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0a0705]"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-1 w-36 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="animate-loader-bar absolute inset-y-0 start-0 w-1/3 rounded-full bg-gradient-to-r from-amber-700/20 via-amber-500/80 to-amber-700/20" />
        </div>
        <p className="text-sm font-medium tracking-[0.2em] text-stone-500 uppercase">
          BrewAtlas
        </p>
      </div>
    </div>
  );
}

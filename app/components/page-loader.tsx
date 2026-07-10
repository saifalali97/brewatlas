"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./use-media-query";

export function PageLoader() {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"loading" | "exit" | "done">("loading");

  useEffect(() => {
    if (reducedMotion) return;

    const exitTimer = window.setTimeout(() => setPhase("exit"), 520);
    const doneTimer = window.setTimeout(() => setPhase("done"), 980);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [reducedMotion]);

  if (reducedMotion || phase === "done") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0705] transition-opacity duration-[460ms] ease-out ${
        phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-1 w-36 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="animate-loader-bar absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-amber-700/20 via-amber-500/80 to-amber-700/20" />
        </div>
        <p className="text-sm font-medium tracking-[0.2em] text-stone-500 uppercase">
          BrewAtlas
        </p>
      </div>
    </div>
  );
}

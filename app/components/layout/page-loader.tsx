"use client";

import { useEffect, useState } from "react";

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function PageLoader() {
  const [phase, setPhase] = useState<"loading" | "exit" | "done">(() =>
    isTouchDevice() ? "done" : "loading",
  );

  useEffect(() => {
    if (isTouchDevice()) return;

    const exitTimer = window.setTimeout(() => setPhase("exit"), 520);
    const doneTimer = window.setTimeout(() => setPhase("done"), 980);
    const safetyTimer = window.setTimeout(() => setPhase("done"), 1800);

    const dismiss = () => setPhase("done");
    window.addEventListener("pageshow", dismiss);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      window.clearTimeout(safetyTimer);
      window.removeEventListener("pageshow", dismiss);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className={`motion-reduce:hidden pointer-events-none fixed inset-0 z-10 flex items-center justify-center bg-[#0a0705] transition-opacity duration-[460ms] ease-out ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
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

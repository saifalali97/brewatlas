"use client";

import { useEffect, type ReactNode } from "react";
import { logSafariDebug, SAFARI_CRASH_DEBUG } from "@/lib/debug/safari-crash-debug";

type DebugMountLoggerProps = {
  name: string;
  children: ReactNode;
};

/**
 * TEMPORARY — logs when an instrumented subtree mounts/unmounts in the browser.
 */
export function DebugMountLogger({ name, children }: DebugMountLoggerProps) {
  useEffect(() => {
    if (!SAFARI_CRASH_DEBUG.logMounts) return;

    logSafariDebug(name, "mounted");

    return () => {
      logSafariDebug(name, "unmounted");
    };
  }, [name]);

  return children;
}

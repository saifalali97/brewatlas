"use client";

import type { ReactNode } from "react";
import { DebugErrorBoundary } from "@/app/components/debug/debug-error-boundary";
import { DebugMountLogger } from "@/app/components/debug/debug-mount-logger";

/**
 * TEMPORARY — client boundary around /account page content for Safari crash bisection.
 */
export function DebugAccountShell({ children }: { children: ReactNode }) {
  return (
    <DebugErrorBoundary name="AccountPage">
      <DebugMountLogger name="AccountPage">{children}</DebugMountLogger>
    </DebugErrorBoundary>
  );
}

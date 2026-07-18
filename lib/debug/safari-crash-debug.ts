/**
 * TEMPORARY — Safari /account crash bisection flags.
 * Remove this file and all debug imports after the faulting component is identified.
 *
 * Bisection order:
 * 1. Deploy with defaults below (NotificationsBell stripped, boundaries on).
 * 2. If Safari still crashes → set stripNotificationsBell: false, stripSiteNav: true.
 * 3. If still crashes → stripEntireAuthenticatedChrome: true (layout becomes <div>{children}</div>).
 * 4. If crash disappears at step 3 → re-enable chrome one flag at a time.
 * 5. Read Safari Web Inspector console for [DEBUG CRASH] / [DEBUG window.error] lines.
 */
export const SAFARI_CRASH_DEBUG = {
  /** Log component mount/unmount to console.error (visible in Safari Web Inspector). */
  logMounts: true,

  /** Step 3: pass null instead of NotificationsBell when signed in. */
  stripNotificationsBell: true,

  /** Step 4: replace SiteNav with a placeholder div. */
  stripSiteNav: false,

  /** Step 5: when signed in, render only <div>{children}</div> (no nav/footer/floating actions). */
  stripEntireAuthenticatedChrome: false,
} as const;

export function logSafariDebug(
  source: string,
  message: string,
  extra?: Record<string, unknown>,
): void {
  console.error(`[DEBUG ${source}] ${message}`, extra ?? "");
}

export function logSafariCrash(
  componentName: string,
  error: unknown,
  componentStack?: string | null,
): void {
  const normalized =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : "Unknown throw");

  console.error("[DEBUG CRASH]", {
    component: componentName,
    message: normalized.message,
    error: normalized,
    stack: normalized.stack ?? "(no stack)",
    componentStack: componentStack ?? "(no component stack)",
  });
}

/**
 * Runs before the app hydrates. Surfaces the first client error that would
 * otherwise leave the page non-interactive on iOS Safari (Web Inspector).
 */
console.log("[BrewAtlas:boot] client bundle executing");

window.addEventListener("error", (event) => {
  console.error(
    "[BrewAtlas:client-error]",
    event.message,
    event.filename ?? "(inline)",
    event.lineno,
    event.colno,
    event.error?.stack ?? "",
  );
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[BrewAtlas:client-rejection]", event.reason);
});

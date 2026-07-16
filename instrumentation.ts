export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnvironment } = await import("./lib/env");
    const result = validateEnvironment();
    if (!result.ok) {
      console.warn("[env] missing required variables:", result.missing.join(", "));
    }

    const { ensureInitialAdminFromEnv } = await import("./lib/auth/seed-initial-admin");
    await ensureInitialAdminFromEnv();
  }
}

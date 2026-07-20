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

type RequestErrorContext = {
  routerKind: "App Router" | "Pages Router";
};

/** Captures unhandled server request errors (API routes, Server Components, Server Actions). */
export async function onRequestError(
  error: Error & { digest?: string },
  request: { path: string; method: string; headers: Record<string, string | string[] | undefined> },
  context: RequestErrorContext,
): Promise<void> {
  const { captureError } = await import("./lib/observability/capture-error");
  captureError(error, {
    source: "server.request",
    digest: error.digest,
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
  });
}

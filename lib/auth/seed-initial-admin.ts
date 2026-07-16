import "server-only";

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

/** Email of the account that should always retain admin access (set in Vercel env). */
export function getInitialAdminEmail(): string | null {
  const email = process.env.BREWATLAS_INITIAL_ADMIN_EMAIL?.trim();
  return email && email.length > 0 ? email : null;
}

/** Idempotent bootstrap — safe to run on every server boot / deployment. */
export async function ensureInitialAdminFromEnv(): Promise<void> {
  const email = getInitialAdminEmail();
  if (!email || !hasAdminClient()) {
    return;
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.rpc("bootstrap_initial_admin", { p_email: email });
    if (error) {
      console.error("[admin] bootstrap_initial_admin failed", error.message);
    }
  } catch (error) {
    console.error("[admin] ensureInitialAdminFromEnv failed", error);
  }
}

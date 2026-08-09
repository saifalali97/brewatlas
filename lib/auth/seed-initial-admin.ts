import "server-only";

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

/** Email of the account that should always retain admin access (set in Vercel env). */
export function getInitialAdminEmail(): string | null {
  const email = process.env.BREWATLAS_INITIAL_ADMIN_EMAIL?.trim();
  return email && email.length > 0 ? email : null;
}

/**
 * Optional recovery password for the bootstrap admin email.
 * When set, updates that existing Auth user only — never creates a new account.
 */
export function getInitialAdminPassword(): string | null {
  const password = process.env.BREWATLAS_INITIAL_ADMIN_PASSWORD?.trim();
  return password && password.length > 0 ? password : null;
}

async function findAuthUserIdByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<string | null> {
  const normalized = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("[admin] listUsers failed while restoring bootstrap password", error.message);
      return null;
    }

    const match = data.users.find((user) => (user.email ?? "").toLowerCase() === normalized);
    if (match?.id) return match.id;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

/**
 * Idempotent bootstrap — safe to run on every server boot / deployment.
 * Promotes the bootstrap email to admin and optionally restores its password
 * when BREWATLAS_INITIAL_ADMIN_PASSWORD is set (existing user only).
 */
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

    const password = getInitialAdminPassword();
    if (!password) return;

    const userId = await findAuthUserIdByEmail(admin, email);
    if (!userId) {
      console.error(
        "[admin] BREWATLAS_INITIAL_ADMIN_PASSWORD is set but no Auth user exists for",
        email,
        "— refusing to create a duplicate account",
      );
      return;
    }

    const { error: passwordError } = await admin.auth.admin.updateUserById(userId, { password });
    if (passwordError) {
      console.error("[admin] bootstrap password restore failed", passwordError.message);
    }
  } catch (error) {
    console.error("[admin] ensureInitialAdminFromEnv failed", error);
  }
}

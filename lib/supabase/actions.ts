"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { buildAuthCallbackUrl } from "@/lib/auth/redirect-url";
import {
  isNextNavigationError,
  logSafariAccountComparison,
  logServerAuthDebug,
  logServerAuthException,
  summarizeRscRequestHeaders,
} from "@/lib/debug/server-auth-debug";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { ensureProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { error?: string; success?: string } | undefined;

/** Only ever redirect to a same-site path, never to an attacker-supplied URL. */
function readRedirectTarget(formData: FormData): string {
  const value = formData.get("redirectTo");
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/account";
}

export async function signInWithPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = readRedirectTarget(formData);

  logServerAuthDebug("signInWithPasswordAction", "entry", {
    redirectTo,
    hasEmail: Boolean(email),
    hasPassword: Boolean(password),
  });

  try {
    const headerStore = await headers();
    logSafariAccountComparison("signInWithPasswordAction", "entry", {
      redirectTo,
      rsc: summarizeRscRequestHeaders(headerStore),
    });

    const dictionary = await getDictionary(await getLocale());

    if (!email || !password) {
      logServerAuthDebug("signInWithPasswordAction", "exit", { reason: "missing_credentials" });
      return { error: dictionary.auth.enterEmailAndPassword };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      logServerAuthDebug("signInWithPasswordAction", "exit", {
        reason: "auth_error",
        message: error.message,
      });
      return { error: error.message };
    }

    if (data.user) {
      logServerAuthDebug("signInWithPasswordAction", "step", {
        step: "ensureProfile",
        userId: data.user.id,
      });
      await ensureProfile(supabase, data.user);
    }

    const headerStoreAfter = await headers();
    logSafariAccountComparison("signInWithPasswordAction", "redirect", {
      target: redirectTo,
      userId: data.user?.id ?? null,
      rsc: summarizeRscRequestHeaders(headerStoreAfter),
      note: "Server Action redirect — Safari must persist Set-Cookie from prior response chain",
    });

    logServerAuthDebug("signInWithPasswordAction", "redirect", {
      target: redirectTo,
      userId: data.user?.id ?? null,
    });
    redirect(redirectTo);
  } catch (error) {
    if (!isNextNavigationError(error)) {
      logServerAuthException("signInWithPasswordAction", error, { redirectTo });
    }
    throw error;
  }
}

export async function signOutAction(): Promise<void> {
  logServerAuthDebug("signOutAction", "entry", {});

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.auth.signOut();

    logServerAuthDebug("signOutAction", "redirect", {
      target: "/login",
      userId: user?.id ?? null,
    });
    redirect("/login");
  } catch (error) {
    if (!isNextNavigationError(error)) {
      logServerAuthException("signOutAction", error, {});
    }
    throw error;
  }
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  logServerAuthDebug("requestPasswordResetAction", "entry", { hasEmail: Boolean(email) });

  try {
    const dictionary = await getDictionary(await getLocale());

    if (!email) {
      return { error: dictionary.auth.enterEmailAddress };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildAuthCallbackUrl("/reset-password"),
    });

    if (error) {
      logServerAuthDebug("requestPasswordResetAction", "exit", { reason: "auth_error", message: error.message });
      return { error: error.message };
    }

    logServerAuthDebug("requestPasswordResetAction", "exit", { reason: "success" });
    return {
      success: dictionary.auth.passwordResetLinkSent,
    };
  } catch (error) {
    logServerAuthException("requestPasswordResetAction", error, {});
    throw error;
  }
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  logServerAuthDebug("updatePasswordAction", "entry", {});

  try {
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const dictionary = await getDictionary(await getLocale());

    if (password.length < 8) {
      return { error: dictionary.forms.passwordTooShort };
    }
    if (password !== confirmPassword) {
      return { error: dictionary.forms.passwordsDoNotMatch };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      logServerAuthDebug("updatePasswordAction", "exit", { reason: "auth_error", message: error.message });
      return { error: error.message };
    }

    logServerAuthDebug("updatePasswordAction", "redirect", {
      target: "/account",
      userId: user?.id ?? null,
    });
    redirect("/account");
  } catch (error) {
    if (!isNextNavigationError(error)) {
      logServerAuthException("updatePasswordAction", error, {});
    }
    throw error;
  }
}

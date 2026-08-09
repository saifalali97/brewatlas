/** Shared strong-password rules for authenticated password changes. */

export const STRONG_PASSWORD_MIN_LENGTH = 12;

export type PasswordPolicyFailure =
  | "too_short"
  | "missing_upper"
  | "missing_lower"
  | "missing_digit"
  | "missing_special"
  | "same_as_current";

/**
 * Validates a candidate password against BrewAtlas strong-password policy.
 * Returns null when valid.
 */
export function validateStrongPassword(
  password: string,
  options?: { currentPassword?: string },
): PasswordPolicyFailure | null {
  if (password.length < STRONG_PASSWORD_MIN_LENGTH) return "too_short";
  if (!/[A-Z]/.test(password)) return "missing_upper";
  if (!/[a-z]/.test(password)) return "missing_lower";
  if (!/[0-9]/.test(password)) return "missing_digit";
  if (!/[^A-Za-z0-9]/.test(password)) return "missing_special";
  if (options?.currentPassword && password === options.currentPassword) return "same_as_current";
  return null;
}

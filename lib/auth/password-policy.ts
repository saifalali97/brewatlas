import { z } from "zod";

/** Shared BrewAtlas password policy for signup, reset, and change-password. */

export const PASSWORD_MIN_LENGTH = 8;

/** @deprecated Use PASSWORD_MIN_LENGTH. */
export const STRONG_PASSWORD_MIN_LENGTH = PASSWORD_MIN_LENGTH;

export type PasswordPolicyFailure =
  | "too_short"
  | "missing_letter"
  | "missing_digit"
  | "same_as_current";

export type PasswordPolicyMessages = {
  tooShort: string;
  missingLetter: string;
  missingDigit: string;
  sameAsCurrent?: string;
};

/**
 * Validates a candidate password against BrewAtlas policy:
 * min 8 characters, at least one letter, at least one number.
 * Uppercase and special characters are optional.
 * Returns null when valid.
 */
export function validatePassword(
  password: string,
  options?: { currentPassword?: string },
): PasswordPolicyFailure | null {
  if (password.length < PASSWORD_MIN_LENGTH) return "too_short";
  if (!/[A-Za-z]/.test(password)) return "missing_letter";
  if (!/[0-9]/.test(password)) return "missing_digit";
  if (options?.currentPassword && password === options.currentPassword) return "same_as_current";
  return null;
}

/** @deprecated Use validatePassword. */
export const validateStrongPassword = validatePassword;

/** Maps a policy failure to a localized message. */
export function passwordPolicyMessage(
  failure: PasswordPolicyFailure,
  messages: PasswordPolicyMessages,
): string {
  switch (failure) {
    case "too_short":
      return messages.tooShort;
    case "missing_letter":
      return messages.missingLetter;
    case "missing_digit":
      return messages.missingDigit;
    case "same_as_current":
      return messages.sameAsCurrent ?? messages.tooShort;
  }
}

/** Zod schema enforcing the shared password policy. */
export const passwordSchema = z.string().superRefine((password, ctx) => {
  const failure = validatePassword(password);
  if (!failure) return;

  const message =
    failure === "too_short"
      ? `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
      : failure === "missing_letter"
        ? "Password must include at least one letter."
        : "Password must include at least one number.";

  ctx.addIssue({ code: z.ZodIssueCode.custom, message });
});

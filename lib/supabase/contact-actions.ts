"use server";

import { requiredString } from "@/lib/forms/form-fields";
import { sanitizeEmail } from "@/lib/security/sanitize";

export type ContactFormState = { error?: string; success?: boolean } | undefined;

const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4000;

/** Validates and accepts a contact form submission (no persistence yet — spam-safe stub). */
export async function submitContactFormAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const honeypot = formData.get("company");
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { success: true };
  }

  const name = requiredString(formData, "name", MAX_NAME_LENGTH);
  const email = sanitizeEmail(formData.get("email")?.toString());
  const message = requiredString(formData, "message", MAX_MESSAGE_LENGTH);

  if (!name || !email || !message) {
    return { error: "invalid" };
  }

  // Contact inbox integration can be wired here (email provider, CRM, etc.).
  console.info("[contact] message received", { name, email, messageLength: message.length });

  return { success: true };
}

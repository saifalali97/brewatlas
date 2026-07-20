"use server";

import { headers } from "next/headers";
import { insertContactMessage } from "@/lib/data/contact-messages";
import { requiredString } from "@/lib/forms/form-fields";
import { captureError } from "@/lib/observability/capture-error";
import { logInfo } from "@/lib/observability/logger";
import { verifySameOriginHeaders } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import { sanitizeEmail } from "@/lib/security/sanitize";

export type ContactFormState = { error?: string; success?: boolean } | undefined;

const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4000;

/** Validates, rate-limits, and persists a contact form submission. */
export async function submitContactFormAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const referer = headerStore.get("referer");

  if (!verifySameOriginHeaders(origin, referer)) {
    return { error: "invalid" };
  }

  const clientIp = getClientIp({ headers: headerStore });
  const rateLimit = checkRateLimit(clientIp, RATE_LIMITS.contactForm);
  if (!rateLimit.allowed) {
    return { error: "rate_limited" };
  }

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

  const result = await insertContactMessage({
    name,
    email,
    message,
    ipAddress: clientIp,
    userAgent: headerStore.get("user-agent"),
  });

  if ("error" in result) {
    captureError(new Error(result.error), {
      source: "contact.submit",
      email,
      ip: clientIp,
    });
    return { error: "send_failed" };
  }

  logInfo("contact.message.saved", {
    messageId: result.id,
    email,
    messageLength: message.length,
  });

  return { success: true };
}

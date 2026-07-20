import "server-only";

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

export type ContactMessageInput = {
  name: string;
  email: string;
  message: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type InsertContactMessageResult = { id: string } | { error: string };

/** Persists a contact form submission using the service-role client. */
export async function insertContactMessage(input: ContactMessageInput): Promise<InsertContactMessageResult> {
  if (!hasAdminClient()) {
    return { error: "Contact form is temporarily unavailable." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("contact_messages")
    .insert({
      name: input.name,
      email: input.email,
      message: input.message,
      ip_address: input.ipAddress ?? null,
      user_agent: input.userAgent ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Failed to save contact message." };
  }

  return { id: data.id as string };
}

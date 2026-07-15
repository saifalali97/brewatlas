import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/env";

/** Anonymous Supabase client for read-only public data (no cookies). Safe inside `unstable_cache`. */
export function createPublicClient() {
  return createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

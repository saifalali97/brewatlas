import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components. `createBrowserClient`
 * manages a singleton under the hood, so it's cheap to call this from
 * multiple components.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

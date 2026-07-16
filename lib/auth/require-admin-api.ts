import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveIsAdmin } from "@/lib/auth/is-admin";

type AdminApiDenied = {
  ok: false;
  response: NextResponse;
};

type AdminApiAllowed = {
  ok: true;
  userId: string;
};

export type AdminApiSession = AdminApiDenied | AdminApiAllowed;

/** JSON gate for `/api/admin/*` route handlers — mirrors proxy middleware behavior. */
export async function requireAdminApi(): Promise<AdminApiSession> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  const allowed = await resolveIsAdmin(supabase, authData.user.id);
  if (!allowed) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  return { ok: true, userId: authData.user.id };
}

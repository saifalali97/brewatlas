import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

/** Lightweight admin API probe — used to verify middleware + handler auth layers. */
export async function GET() {
  const session = await requireAdminApi();
  if (!session.ok) return session.response;

  return NextResponse.json({ ok: true, userId: session.userId });
}

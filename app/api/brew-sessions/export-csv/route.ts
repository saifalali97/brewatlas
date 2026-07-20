import { NextResponse } from "next/server";
import { brewSessionsToCsv, exportBrewSessions } from "@/lib/data/brew-sessions";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await exportBrewSessions(supabase, authData.user.id);
  const csv = brewSessionsToCsv(payload);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="brew-sessions.csv"',
    },
  });
}

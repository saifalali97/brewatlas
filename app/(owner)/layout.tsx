import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleCanAccessDashboard } from "@/lib/auth/permissions";

/** Root owner route group gate — ensures CMS pages never render without owner access. */
export default async function OwnerRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (!roleCanAccessDashboard(profile?.role)) {
    redirect("/");
  }

  return children;
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your BrewAtlas account.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/reset-password",
  },
};

export default async function ResetPasswordPage() {
  // Only reachable with a valid (recovery) session, established by
  // /auth/callback after the user clicks the emailed reset link.
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/forgot-password");
  }

  return (
    <SectionFrame id="reset-password-page" ariaLabelledBy="reset-password-page-heading" padding="compact">
      <PageHeader
        eyebrow="Account Recovery"
        title="Reset Password"
        description="Choose a new password to finish recovering your account."
      />

      <div className="mx-auto max-w-md rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <ResetPasswordForm />
      </div>
    </SectionFrame>
  );
}

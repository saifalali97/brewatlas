import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset the password for your BrewAtlas account.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/forgot-password",
  },
};

export default function ForgotPasswordPage() {
  return (
    <SectionFrame id="forgot-password-page" ariaLabelledBy="forgot-password-page-heading" padding="compact">
      <PageHeader
        eyebrow="Account Recovery"
        title="Forgot Password"
        description="Enter your email and we'll send you a link to reset your password."
      />

      <div className="mx-auto max-w-md rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-stone-500">
          Remember your password?{" "}
          <Link href="/login" className="text-amber-400/90 underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </SectionFrame>
  );
}

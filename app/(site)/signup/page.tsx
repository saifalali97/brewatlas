import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { OAuthButtons } from "@/app/components/auth/oauth-buttons";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a free BrewAtlas account to save recipes, track brews, and unlock Premium features.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/signup",
  },
};

export default function SignupPage() {
  return (
    <SectionFrame id="signup-page" ariaLabelledBy="signup-page-heading" padding="compact">
      <PageHeader eyebrow="Join BrewAtlas" title="Create Your Account" />

      <div className="mx-auto max-w-md rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <SignupForm />

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-xs tracking-[0.08em] text-stone-500 uppercase">or</span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <OAuthButtons />

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-400/90 underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </SectionFrame>
  );
}

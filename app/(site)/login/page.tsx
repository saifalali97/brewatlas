import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { OAuthButtons } from "@/app/components/auth/oauth-buttons";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your BrewAtlas account to access saved recipes, brew tracking, and Premium features.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/login",
  },
};

type LoginPageProps = {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo, error } = await searchParams;

  return (
    <SectionFrame id="login-page" ariaLabelledBy="login-page-heading" padding="compact">
      <PageHeader eyebrow="Welcome Back" title="Log In" />

      <div className="mx-auto max-w-md rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <LoginForm redirectTo={redirectTo} initialError={error} />

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-xs tracking-[0.08em] text-stone-500 uppercase">or</span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <OAuthButtons />

        <p className="mt-6 text-center text-sm text-stone-500">
          New to BrewAtlas?{" "}
          <Link href="/signup" className="text-amber-400/90 underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </SectionFrame>
  );
}

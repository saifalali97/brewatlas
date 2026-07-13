"use client";

import { useState } from "react";
import { buttons } from "@/lib/constants/styles";

export function LoginForm() {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitting(true);
        window.setTimeout(() => setSubmitting(false), 900);
      }}
      className="space-y-5"
    >
      <div>
        <label htmlFor="email" className="text-sm font-medium text-stone-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-stone-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" disabled={submitting} className={`${buttons.primary} w-full disabled:opacity-70`}>
        {submitting ? "Signing in…" : "Continue"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { buttons } from "@/lib/constants/styles";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-[1.5rem] border border-amber-500/25 bg-amber-950/20 p-8 text-center">
        <p className="text-lg font-medium text-stone-50">Message sent</p>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          Thanks for reaching out — our barista support team will reply within one
          business day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-5"
    >
      <div>
        <label htmlFor="name" className="text-sm font-medium text-stone-300">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45"
          placeholder="Your name"
        />
      </div>

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
        <label htmlFor="message" className="text-sm font-medium text-stone-300">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45"
          placeholder="How can we help?"
        />
      </div>

      <button type="submit" className={`${buttons.primary} w-full`}>
        Send Message
      </button>
    </form>
  );
}

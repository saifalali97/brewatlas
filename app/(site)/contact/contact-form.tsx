"use client";

import { useState } from "react";
import { buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";

export function ContactForm() {
  const { t } = useTranslations();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-[1.5rem] border border-amber-500/25 bg-amber-950/20 p-8 text-center">
        <p className="text-lg font-medium text-stone-50">{t("contactPage.messageSentTitle")}</p>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">{t("contactPage.messageSentBody")}</p>
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
          {t("contactPage.nameLabel")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45"
          placeholder={t("contactPage.namePlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium text-stone-300">
          {t("auth.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45"
          placeholder={t("auth.emailPlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium text-stone-300">
          {t("contactPage.messageLabel")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45"
          placeholder={t("contactPage.messagePlaceholder")}
        />
      </div>

      <button type="submit" className={`${buttons.primary} w-full`}>
        {t("contactPage.sendMessageCta")}
      </button>
    </form>
  );
}

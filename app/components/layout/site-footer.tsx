import type { ReactNode } from "react";
import Link from "next/link";
import {
  AtSign,
  ExternalLink,
  Globe,
  Heart,
  Moon,
  Rss,
  Share2,
} from "lucide-react";
import { RevealOnScroll } from "@/app/components/ui/reveal-on-scroll";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { buttons } from "@/lib/constants/styles";
import { LOCALE_METADATA, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/types/i18n";

type FooterLinkItem = { href: string; label: string };

function buildExploreLinks(footer: Dictionary["homeFooter"]): FooterLinkItem[] {
  return [
    { href: "/recipes", label: footer.linkRecipes },
    { href: "/methods", label: footer.linkMethods },
    { href: "/origins", label: footer.linkOrigins },
    { href: "/roasters", label: footer.linkRoasters },
    { href: "/culture", label: footer.linkCulture },
    { href: "/culture/arabic-coffee", label: footer.linkArabicCoffee },
    { href: "/culture/tea", label: footer.linkTeaKarak },
    { href: "/coach", label: footer.linkCoach },
    { href: "/community", label: footer.linkCommunity },
    { href: "/premium", label: footer.linkPremium },
  ];
}

function buildCompanyLinks(footer: Dictionary["homeFooter"]): FooterLinkItem[] {
  return [
    { href: "/about", label: footer.linkAbout },
    { href: "#", label: footer.linkBlog },
    { href: "#", label: footer.linkCareers },
    { href: "/contact", label: footer.linkContact },
    { href: "#", label: footer.linkPress },
  ];
}

function buildSupportLinks(footer: Dictionary["homeFooter"]): FooterLinkItem[] {
  return [
    { href: "#", label: footer.linkHelpCenter },
    { href: "/#faq", label: footer.linkFaq },
    { href: "/privacy", label: footer.linkPrivacyPolicy },
    { href: "/terms", label: footer.linkTerms },
    { href: "/cookies", label: footer.linkCookies },
  ];
}

function buildSocialLinks(footer: Dictionary["homeFooter"]) {
  return [
    { href: "#", label: footer.socialInstagramLabel, icon: Share2 },
    { href: "#", label: footer.socialTwitterLabel, icon: AtSign },
    { href: "#", label: footer.socialYoutubeLabel, icon: ExternalLink },
    { href: "#", label: footer.blogRssLabel, icon: Rss },
  ];
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-block text-sm text-stone-500 underline-offset-4 transition-all duration-300 hover:text-amber-400/90 hover:underline"
      >
        {label}
      </Link>
    </li>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-stone-400">
        {title}
      </h4>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

type SiteFooterProps = {
  footer: Dictionary["homeFooter"];
  locale: Locale;
};

export function SiteFooter({ footer, locale }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const exploreLinks = buildExploreLinks(footer);
  const companyLinks = buildCompanyLinks(footer);
  const supportLinks = buildSupportLinks(footer);
  const socialLinks = buildSocialLinks(footer);
  const copyright = `© ${year} BrewAtlas. ${footer.allRightsReserved}`;

  return (
    <>
      <section
        aria-labelledby="footer-cta-heading"
        className="relative border-t border-white/[0.04] px-5 py-20 sm:px-6 md:px-7 md:py-24 lg:px-8 lg:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(217,119,6,0.12),transparent_65%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-[#0a0705]"
        />

        <RevealOnScroll>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] px-6 py-12 shadow-[0_20px_56px_-20px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-600/10 blur-3xl"
            />

            <div className="relative max-w-2xl">
              <p className="text-[0.8125rem] font-medium uppercase tracking-[0.24em] text-amber-500/90">
                {footer.ctaEyebrow}
              </p>
              <h2
                id="footer-cta-heading"
                className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-stone-50 sm:text-4xl lg:text-[2.75rem]"
              >
                {footer.ctaTitle}
              </h2>
              <p className="mt-6 text-lg leading-[1.78] text-stone-400 md:text-xl md:leading-[1.72]">
                {footer.ctaDescription}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <RippleLink
                  href="/premium"
                  className={`${buttons.primary} motion-reduce:hover:scale-100`}
                >
                  {footer.startPremium}
                </RippleLink>
                <RippleLink
                  href="/recipes"
                  className={`${buttons.secondary} motion-reduce:hover:scale-100`}
                >
                  {footer.browseRecipes}
                </RippleLink>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <footer className="border-t border-white/[0.04] bg-[#080504] px-5 pb-8 pt-16 sm:px-6 md:px-7 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <nav aria-label={footer.footerNavAriaLabel} className="grid gap-12 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-16">
              <div className="sm:col-span-2 lg:col-span-1">
                <Link
                  href="/"
                  aria-label={footer.homeAriaLabel}
                  className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-stone-50 transition-colors duration-300 hover:text-amber-100"
                >
                  <span
                    aria-hidden
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-600/30 bg-amber-950/40 text-sm text-amber-400"
                  >
                    B
                  </span>
                  BrewAtlas
                </Link>
                <p className="mt-5 max-w-xs text-sm leading-[1.8] text-stone-500">
                  {footer.tagline}
                </p>

                <div className="mt-6 flex items-center gap-2.5" aria-label={footer.socialLinksAriaLabel}>
                  {socialLinks.map(({ href, label, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-stone-500 transition-all duration-300 hover:border-amber-600/35 hover:bg-amber-950/30 hover:text-amber-400/90"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </a>
                  ))}
                </div>

                <p className="mt-8 text-xs text-stone-600 lg:hidden">
                  {copyright}
                </p>
              </div>

              <FooterColumn title={footer.exploreColumn}>
                {exploreLinks.map((link) => (
                  <FooterLink key={link.label} {...link} />
                ))}
              </FooterColumn>

              <FooterColumn title={footer.companyColumn}>
                {companyLinks.map((link) => (
                  <FooterLink key={link.label} {...link} />
                ))}
              </FooterColumn>

              <FooterColumn title={footer.supportColumn}>
                {supportLinks.map((link) => (
                  <FooterLink key={link.label} {...link} />
                ))}
              </FooterColumn>
            </nav>
          </RevealOnScroll>

          <div className="mt-14 flex flex-col gap-5 border-t border-white/[0.06] pt-8 lg:mt-16 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <p className="hidden text-sm text-stone-600 lg:block">
                {copyright}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-stone-600">
                {footer.madeWithPrefix}
                <Heart className="h-3.5 w-3.5 fill-amber-600/70 text-amber-600/70" aria-hidden />
                {footer.forSpecialtyCoffee}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-stone-500 transition-colors duration-300 hover:border-amber-600/25 hover:text-stone-300">
                <Globe className="h-3.5 w-3.5 text-amber-500/75" aria-hidden />
                <span className="sr-only">{footer.languageLabel}</span>
                <select
                  defaultValue={locale}
                  className="cursor-pointer bg-transparent text-sm text-stone-400 outline-none"
                  aria-label={footer.languageLabel}
                >
                  {SUPPORTED_LOCALES.map((supportedLocale) => (
                    <option key={supportedLocale} value={supportedLocale}>
                      {LOCALE_METADATA[supportedLocale].nativeName}
                    </option>
                  ))}
                </select>
              </label>

              <div
                className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-stone-500"
                aria-label={footer.themeAriaLabelPrefix}
              >
                <Moon className="h-3.5 w-3.5 text-amber-500/75" aria-hidden />
                <span>{footer.darkLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

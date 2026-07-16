import type { ReactNode } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/app/components/layout/language-switcher";
import { TextLink } from "@/app/components/ui/text-link";
import { dsLayout, dsTypography } from "@/lib/constants/styles";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/types/i18n";

type FooterLinkItem = { href: string; label: string };

function buildExploreLinks(footer: Dictionary["homeFooter"]): FooterLinkItem[] {
  return [
    { href: "/recipes", label: footer.linkRecipes },
    { href: "/origins", label: footer.linkOrigins },
    { href: "/roasters", label: footer.linkRoasters },
    { href: "/devices", label: footer.linkDevices },
    { href: "/culture", label: footer.linkCulture },
  ];
}

function buildProductLinks(footer: Dictionary["homeFooter"]): FooterLinkItem[] {
  return [
    { href: "/search", label: footer.linkSearch },
    { href: "/coach", label: footer.linkCoach },
    { href: "/premium", label: footer.linkPremium },
  ];
}

function buildCompanyLinks(footer: Dictionary["homeFooter"]): FooterLinkItem[] {
  return [
    { href: "/about", label: footer.linkAbout },
    { href: "/contact", label: footer.linkContact },
  ];
}

function buildLegalLinks(footer: Dictionary["homeFooter"]): FooterLinkItem[] {
  return [
    { href: "/privacy", label: footer.linkPrivacyPolicy },
    { href: "/terms", label: footer.linkTerms },
    { href: "/cookies", label: footer.linkCookies },
  ];
}

function FooterLink({ href, label }: FooterLinkItem) {
  return (
    <li>
      <TextLink href={href} variant="footer">
        {label}
      </TextLink>
    </li>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-stone-400">
        {title}
      </h3>
      <ul className="mt-5 space-y-3.5">{children}</ul>
    </div>
  );
}

type SiteFooterProps = {
  footer: Dictionary["homeFooter"];
  locale: Locale;
  switchLanguageAria: string;
  languageAriaLabel: string;
};

export function SiteFooter({ footer, locale, switchLanguageAria, languageAriaLabel }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const copyright = `© ${year} BrewAtlas. ${footer.allRightsReserved}`;

  return (
    <footer className="relative border-t border-white/[0.06] bg-uae-dark-coffee px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] pt-16 sm:px-8 lg:px-12 lg:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-uae-warm-gold/20 to-transparent"
      />
      <div className={dsLayout.container}>
        <nav aria-label={footer.footerNavAriaLabel} className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link
              href="/"
              aria-label={footer.homeAriaLabel}
              className="inline-flex items-center gap-2.5 text-xl font-semibold tracking-tight text-uae-pearl transition-colors duration-300 hover:text-uae-sand"
            >
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-uae-warm-gold/25 bg-uae-warm-gold/10 text-sm text-uae-warm-gold"
              >
                B
              </span>
              BrewAtlas
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-[1.8] text-stone-500">{footer.tagline}</p>
          </div>

          <div className="grid gap-10 sm:col-span-1 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
            <FooterColumn title={footer.exploreColumn}>
              {buildExploreLinks(footer).map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </FooterColumn>

            <FooterColumn title={footer.productColumn}>
              {buildProductLinks(footer).map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </FooterColumn>

            <div className="space-y-10">
              <FooterColumn title={footer.companyColumn}>
                {buildCompanyLinks(footer).map((link) => (
                  <FooterLink key={link.href} {...link} />
                ))}
              </FooterColumn>

              <FooterColumn title={footer.legalColumn}>
                {buildLegalLinks(footer).map((link) => (
                  <FooterLink key={link.href} {...link} />
                ))}
              </FooterColumn>
            </div>
          </div>
        </nav>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/[0.06] pt-8 lg:mt-16 lg:flex-row lg:items-center lg:justify-between">
          <p className={`text-sm ${dsTypography.caption}`}>{copyright}</p>

          <LanguageSwitcher
            currentLocale={locale}
            switchLanguageAria={switchLanguageAria}
            languageAriaLabel={languageAriaLabel}
            size="large"
          />
        </div>
      </div>
    </footer>
  );
}

"use client";

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

const exploreLinks = [
  { href: "#recipes", label: "Recipes" },
  { href: "#methods", label: "Methods" },
  { href: "#origins", label: "Origins" },
  { href: "#roasters", label: "Roasters" },
  { href: "#pricing", label: "Premium" },
];

const companyLinks = [
  { href: "#", label: "About" },
  { href: "#", label: "Blog" },
  { href: "#", label: "Careers" },
  { href: "#", label: "Contact" },
  { href: "#", label: "Press" },
];

const supportLinks = [
  { href: "#", label: "Help Center" },
  { href: "#faq", label: "FAQ" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms" },
  { href: "#", label: "Cookies" },
];

const socialLinks = [
  { href: "#", label: "Instagram", icon: Share2 },
  { href: "#", label: "Twitter", icon: AtSign },
  { href: "#", label: "YouTube", icon: ExternalLink },
  { href: "#", label: "Blog RSS", icon: Rss },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        className="inline-block text-sm text-stone-500 underline-offset-4 transition-all duration-300 hover:text-amber-400/90 hover:underline"
      >
        {label}
      </a>
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

export function SiteFooter() {
  const year = new Date().getFullYear();

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
                Start Brewing Better
              </p>
              <h2
                id="footer-cta-heading"
                className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-stone-50 sm:text-4xl lg:text-[2.75rem]"
              >
                Ready to unlock the full BrewAtlas experience?
              </h2>
              <p className="mt-6 text-lg leading-[1.78] text-stone-400 md:text-xl md:leading-[1.72]">
                Join thousands of baristas exploring premium recipes, brew tracking,
                and AI-powered recommendations.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <RippleLink
                  href="#pricing"
                  className={`${buttons.primary} motion-reduce:hover:scale-100`}
                >
                  Start Premium
                </RippleLink>
                <RippleLink
                  href="#recipes"
                  className={`${buttons.secondary} motion-reduce:hover:scale-100`}
                >
                  Browse Recipes
                </RippleLink>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <footer className="border-t border-white/[0.04] bg-[#080504] px-5 pb-8 pt-16 sm:px-6 md:px-7 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <div className="grid gap-12 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-16">
              <div className="sm:col-span-2 lg:col-span-1">
                <Link
                  href="/"
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
                  The definitive platform for specialty coffee recipes, origins, and
                  brew science. Craft coffee, mapped.
                </p>

                <div className="mt-6 flex items-center gap-2.5">
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
                  © {year} BrewAtlas. All rights reserved.
                </p>
              </div>

              <FooterColumn title="Explore">
                {exploreLinks.map((link) => (
                  <FooterLink key={link.label} {...link} />
                ))}
              </FooterColumn>

              <FooterColumn title="Company">
                {companyLinks.map((link) => (
                  <FooterLink key={link.label} {...link} />
                ))}
              </FooterColumn>

              <FooterColumn title="Support">
                {supportLinks.map((link) => (
                  <FooterLink key={link.label} {...link} />
                ))}
              </FooterColumn>
            </div>
          </RevealOnScroll>

          <div className="mt-14 flex flex-col gap-5 border-t border-white/[0.06] pt-8 lg:mt-16 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <p className="hidden text-sm text-stone-600 lg:block">
                © {year} BrewAtlas. All rights reserved.
              </p>
              <p className="flex items-center gap-1.5 text-sm text-stone-600">
                Made with
                <Heart className="h-3.5 w-3.5 fill-amber-600/70 text-amber-600/70" aria-hidden />
                for specialty coffee
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-stone-500 transition-colors duration-300 hover:border-amber-600/25 hover:text-stone-300">
                <Globe className="h-3.5 w-3.5 text-amber-500/75" aria-hidden />
                <span className="sr-only">Language</span>
                <select
                  defaultValue="en"
                  className="cursor-pointer bg-transparent text-sm text-stone-400 outline-none"
                  aria-label="Select language"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </label>

              <div
                className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-stone-500"
                aria-label="Current theme: Dark"
              >
                <Moon className="h-3.5 w-3.5 text-amber-500/75" aria-hidden />
                <span>Dark</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

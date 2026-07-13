import { SiteNav } from "@/app/components/layout/site-nav";
import { FloatingActions } from "@/app/components/layout/client-chrome";
import { SiteFooter } from "@/lib/dynamic-sections";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";

/**
 * Shared chrome (background, nav, footer) for every public marketing/app
 * page. Markup is unchanged from the original homepage wrapper so "/"
 * keeps rendering pixel-identical output after the move.
 *
 * Resolves the request's locale once and hands translated nav labels
 * down to `<SiteNav>` -- the dictionary itself stays `server-only` and
 * never reaches the client bundle (see `lib/i18n/get-dictionary.ts`).
 */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0705] font-sans text-stone-100">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(180,120,60,0.35),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_20%,rgba(120,70,40,0.2),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_10%_80%,rgba(90,50,30,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_50%_50%,rgba(180,120,60,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(217,119,6,0.04),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_65%,rgba(120,70,40,0.05),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(90,50,30,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(217,119,6,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f0a]/40 via-transparent to-[#0a0705]" />
      </div>

      <SiteNav nav={dictionary.nav} locale={locale} />

      <main id="main-content">{children}</main>

      <FloatingActions />
      <SiteFooter />
    </div>
  );
}

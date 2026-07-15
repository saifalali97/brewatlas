import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ClientPageLoader } from "@/app/components/layout/client-chrome";
import { ServiceWorkerRegistration } from "@/app/components/pwa/service-worker-registration";
import { JsonLd } from "@/app/components/seo/json-ld";
import { directionFor } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { TranslationProvider } from "@/lib/i18n/translation-context";
import { createSiteMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  ...createSiteMetadata(),
  other: {
    "x-build-stamp": "server-html-15-jul-2026",
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const direction = directionFor(locale);

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-stone-50 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-stone-900"
        >
          {dictionary.nav.skipToMainContent}
        </a>
        <JsonLd />
        <ClientPageLoader />
        <ServiceWorkerRegistration />
        <TranslationProvider locale={locale} dictionary={dictionary}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}

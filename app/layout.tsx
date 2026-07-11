import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ClientPageLoader } from "@/app/components/layout/client-chrome";
import { JsonLd } from "@/app/components/seo/json-ld";
import { createSiteMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = createSiteMetadata();

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-stone-50 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-stone-900"
        >
          Skip to main content
        </a>
        <JsonLd />
        <ClientPageLoader />
        {children}
      </body>
    </html>
  );
}

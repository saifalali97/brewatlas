import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { PageLoader } from "@/app/components/layout/page-loader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrewAtlas — Specialty Coffee Recipes",
  description:
    "The world's largest specialty coffee recipe platform. Explore recipes, origins, brew methods, and premium tools.",
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
        <PageLoader />
        {children}
      </body>
    </html>
  );
}

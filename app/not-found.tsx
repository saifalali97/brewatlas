import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you are looking for could not be found on BrewAtlas. Return to explore specialty coffee recipes, origins, and brew methods.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-[#0a0705] px-6 text-center text-stone-100"
    >
      <h1 className="text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-stone-400">
        The page you requested does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-stone-50 px-8 text-sm font-medium text-stone-900 transition-all duration-300 hover:bg-stone-200"
      >
        Back to BrewAtlas
      </Link>
    </main>
  );
}

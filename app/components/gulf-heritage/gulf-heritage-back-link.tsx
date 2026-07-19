import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { acFocus } from "@/lib/design-system/atlas-canon";

type GulfHeritageBackLinkProps = {
  href: string;
  label: string;
};

/** Breadcrumb-style back link for Gulf Heritage pages. */
export function GulfHeritageBackLink({ href, label }: GulfHeritageBackLinkProps) {
  return (
    <Link
      href={href}
      className={`mb-10 inline-flex items-center gap-2 text-sm font-medium text-ac-espresso transition-colors duration-300 hover:text-ba-bronze rtl:flex-row-reverse ${acFocus.ring}`}
    >
      <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
      {label}
    </Link>
  );
}

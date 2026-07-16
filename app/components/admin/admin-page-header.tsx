import type { ReactNode } from "react";
import { adminCopy } from "@/lib/admin/copy";
import type { AdminNavItemId } from "@/lib/admin/nav";

type AdminPageHeaderProps = {
  navId: AdminNavItemId;
  title: string;
  description: string;
  children?: ReactNode;
};

export function AdminPageHeader({ navId, title, description, children }: AdminPageHeaderProps) {
  const eyebrow = adminCopy.nav[navId];

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-500/85">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-stone-400 sm:text-base">{description}</p>
      {children}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import { adminCopy } from "@/lib/admin/copy";
import { buildAdminNavItems, isAdminNavActive } from "@/lib/admin/nav";
import { signOutAction } from "@/lib/supabase/actions";

type AdminDashboardShellProps = {
  children: ReactNode;
  displayName: string;
};

export function AdminDashboardShell({ children, displayName }: AdminDashboardShellProps) {
  const pathname = usePathname();
  const menuId = useId();
  const userMenuId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navItems = buildAdminNavItems();
  const labels = adminCopy.shell;

  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) setUserMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [userMenuOpen]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.08] px-5 py-5">
        <Link href="/admin" className="block">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-500/85">{labels.cmsEyebrow}</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-stone-50">BrewAtlas</p>
        </Link>
      </div>
      <nav aria-label={labels.sidebarAriaLabel} className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ id, href, label, icon: Icon }) => {
            const active = isAdminNavActive(pathname, href);
            return (
              <li key={id}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-amber-950/35 font-medium text-amber-100"
                      : "text-stone-400 hover:bg-white/[0.04] hover:text-stone-100"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-white/[0.08] px-5 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 transition-colors hover:text-stone-300"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          {labels.backToSite}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0705] text-stone-100">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_0%_0%,rgba(180,120,60,0.16),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_100%_0%,rgba(90,50,30,0.12),transparent)]" />
      </div>

      <div className="lg:flex">
        <aside className="hidden w-64 shrink-0 border-e border-white/[0.08] bg-[#0d0907]/90 backdrop-blur-2xl lg:sticky lg:top-0 lg:h-screen lg:block">
          {sidebar}
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-[#0a0705]/80 backdrop-blur-sm"
              aria-label={labels.closeMenuAria}
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative h-full w-[min(18rem,88vw)] border-e border-white/[0.08] bg-[#0d0907] shadow-2xl">
              <div className="flex items-center justify-end px-4 py-3">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] text-stone-300"
                  aria-label={labels.closeMenuAria}
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              {sidebar}
            </aside>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0a0705]/90 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] text-stone-300 lg:hidden"
                  aria-label={labels.openMenuAria}
                  aria-expanded={mobileOpen}
                  aria-controls={menuId}
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="h-4 w-4" aria-hidden />
                </button>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">{labels.topNavEyebrow}</p>
                  <p className="text-sm font-medium text-stone-100">{labels.topNavTitle}</p>
                </div>
              </div>

              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  id={userMenuId}
                  className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-sm text-stone-200 transition-colors hover:border-white/[0.16] hover:bg-white/[0.05]"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((open) => !open)}
                >
                  <span className="hidden max-w-[10rem] truncate sm:inline">{displayName}</span>
                  <span className="inline sm:hidden">{labels.userMenuLabel}</span>
                  <ChevronDown className="h-4 w-4 text-stone-500" aria-hidden />
                </button>

                {userMenuOpen ? (
                  <div
                    role="menu"
                    aria-labelledby={userMenuId}
                    className="absolute end-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/[0.1] bg-[#120c09] py-1 shadow-xl"
                  >
                    <Link
                      href="/account"
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm text-stone-300 hover:bg-white/[0.04] hover:text-stone-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {labels.myAccount}
                    </Link>
                    <Link
                      href="/"
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm text-stone-300 hover:bg-white/[0.04] hover:text-stone-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {labels.viewSite}
                    </Link>
                    <form action={signOutAction} className="border-t border-white/[0.08]">
                      <button
                        type="submit"
                        role="menuitem"
                        className="block w-full px-4 py-2.5 text-start text-sm text-stone-400 hover:bg-white/[0.04] hover:text-stone-200"
                      >
                        {labels.signOut}
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main id="admin-dashboard-content" className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

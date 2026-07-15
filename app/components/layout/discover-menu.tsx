"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { dsFocus, dsMotion, dsRadius } from "@/lib/constants/styles";

type DiscoverLink = { href: string; label: string };

type DiscoverMenuProps = {
  label: string;
  menuAriaLabel: string;
  links: DiscoverLink[];
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Desktop Discover dropdown — keyboard accessible. */
export function DiscoverMenu({ label, menuAriaLabel, links }: DiscoverMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="discover-menu-panel"
        aria-label={menuAriaLabel}
        onClick={() => setOpen((current) => !current)}
        className={joinClasses(
          "group relative inline-flex items-center gap-1 px-0.5 py-1.5 text-sm font-medium",
          dsMotion.transition,
          open ? "text-uae-pearl" : "text-stone-400 hover:text-uae-pearl",
          dsFocus.ring,
        )}
      >
        {label}
        <ChevronDown
          className={joinClasses(
            "h-4 w-4 transition-transform duration-300",
            open && "rotate-180",
          )}
          aria-hidden
        />
        <span
          className={joinClasses(
            "absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-uae-warm-gold/90 transition-all duration-500",
            dsMotion.easing,
            open ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id="discover-menu-panel"
          role="menu"
          aria-label={menuAriaLabel}
          className={joinClasses(
            "absolute start-0 top-[calc(100%+0.75rem)] z-50 min-w-[14rem]",
            dsRadius.lg,
            "border border-white/[0.1] bg-uae-dark-coffee/95 p-2 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] backdrop-blur-2xl",
          )}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={joinClasses(
                "flex min-h-10 items-center rounded-lg px-3 py-2 text-sm text-stone-300",
                dsMotion.transition,
                "hover:bg-white/[0.06] hover:text-uae-pearl",
                dsFocus.ring,
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
